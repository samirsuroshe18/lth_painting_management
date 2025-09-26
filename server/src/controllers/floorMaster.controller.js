import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Floor } from '../models/floor.model.js';
import * as XLSX from 'xlsx';
import fs from 'fs';

const addNewFloor = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || !status) {
        throw new ApiError(400, 'Name and status are required fields');
    }

    const newFloor = await Floor.create({
        name,
        status:status==="active"?true:false,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isFloorCreate = await Floor.findById(newFloor._id);

    if (!isFloorCreate) {
        throw new ApiError(500, 'Failed to create Floor');
    }

    return res.status(201).json(
        new ApiResponse(201, isFloorCreate, 'Floor created successfully')
    );
});

const getAllFloor = catchAsync(async (req, res) => {
    const floor = await Floor.find({isDeleted: false}).sort({ createdAt: -1 });

    if (!floor || floor.length === 0) {
        throw new ApiError(404, 'No Floor available.');
    }

    return res.status(200).json(
        new ApiResponse(200, floor, 'Floor retrieved successfully')
    );
});

const updateFloor = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || !status) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedFloor = await Floor.findByIdAndUpdate(
        id,
        { name, status:status==="active"?true:false, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedFloor) {
        throw new ApiError(404, 'Floor not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedFloor, 'Floor updated successfully')
    );
});

const deleteFloor = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedFloor = await Floor.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true }
    );

    if (!deletedFloor) {
        throw new ApiError(404, "Floor not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedFloor, 'Floor deleted successfully')
    );
});

const addFloorsFromExcel = catchAsync(async (req, res) => {
    // Check if file is uploaded
    if (!req.file) {
        throw new ApiError(400, "Excel file is required");
    }

    try {
        // Read Excel file from disk path
        const filePath = req.file.path;
        const workbook = XLSX.default.readFile(filePath);

        // Clean up the uploaded file after reading
        fs.unlinkSync(filePath);

        // Check if workbook and sheets exist
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new ApiError(400, "Invalid Excel file or no sheets found");
        }

        const sheetName = workbook.SheetNames[0]; // Get first sheet
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            throw new ApiError(400, "Worksheet not found in Excel file");
        }

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            throw new ApiError(400, "Excel file is empty or has no valid data");
        }

        // Validate and prepare floor data
        const floorsToCreate = [];
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNumber = i + 2; // Excel row number (accounting for header)

            // Validate required fields
            if (!row.name) {
                errors.push(`Row ${rowNumber}: Missing required field 'name'`);
                continue;
            }

            if (row.status === undefined || row.status === null) {
                errors.push(`Row ${rowNumber}: Missing required field 'status'`);
                continue;
            }

            // Parse status - handle various formats
            let status;
            try {
                if (typeof row.status === 'boolean') {
                    status = row.status;
                } else if (typeof row.status === 'string') {
                    const statusStr = row.status.toString().toLowerCase().trim();
                    if (statusStr === 'true' || statusStr === '1' || statusStr === 'active' || statusStr === 'yes') {
                        status = true;
                    } else if (statusStr === 'false' || statusStr === '0' || statusStr === 'inactive' || statusStr === 'no') {
                        status = false;
                    } else {
                        errors.push(`Row ${rowNumber}: Invalid status format. Use true/false, 1/0, active/inactive, or yes/no`);
                        continue;
                    }
                } else if (typeof row.status === 'number') {
                    status = row.status === 1 ? true : false;
                } else {
                    errors.push(`Row ${rowNumber}: Invalid status format. Use true/false, 1/0, active/inactive, or yes/no`);
                    continue;
                }
            } catch (error) {
                errors.push(`Row ${rowNumber}: Error parsing status - ${error.message}`);
                continue;
            }

            // Check for duplicate names in current batch
            const duplicateInBatch = floorsToCreate.find(dept => 
                dept.name.toLowerCase() === row.name.toString().toLowerCase()
            );
            if (duplicateInBatch) {
                errors.push(`Row ${rowNumber}: Duplicate floor name "${row.name}" in Excel file`);
                continue;
            }

            floorsToCreate.push({
                name: row.name.toString().trim(),
                status: status,
                createdBy: req.user._id,
                updatedBy: req.user._id,
            });
        }

        // If there are validation errors, return them
        if (errors.length > 0) {
            throw new ApiError(400, `Validation errors found:\n${errors.join('\n')}`);
        }

        // Check for existing floors in database (case-insensitive)
        const existingNames = await Floor.find({
            name: { 
                $in: floorsToCreate.map(dept => new RegExp(`^${dept.name}$`, 'i'))
            }
        }).select('name');

        if (existingNames.length > 0) {
            const duplicateNames = existingNames.map(dept => dept.name);
            throw new ApiError(400, `Following floor names already exist: ${duplicateNames.join(', ')}`);
        }

        // Create floors using insertMany for better performance
        let createdFloors = [];
        let creationErrors = [];

        try {
            createdFloors = await Floor.insertMany(floorsToCreate, {
                ordered: false // Continue inserting even if some fail
            });
        } catch (error) {
            // Handle bulk insert errors
            if (error.writeErrors && error.writeErrors.length > 0) {
                // Some documents were inserted successfully
                createdFloors = error.insertedDocs || [];
                creationErrors = error.writeErrors.map((writeError, index) => {
                    const failedDept = floorsToCreate[writeError.index];
                    return `Failed to create floor "${failedDept.name}": ${writeError.errmsg}`;
                });
            } else {
                // Complete failure
                throw new ApiError(500, `Failed to create floors: ${error.message}`);
            }
        }

        if (createdFloors.length === 0) {
            throw new ApiError(500, `Failed to create any floors. Errors: ${creationErrors.join(', ')}`);
        }

        // Get populated data for response
        const populatedFloors = await Floor.find({
            _id: { $in: createdFloors.map(dept => dept._id) }
        })
            .populate("createdBy", "userName email")
            .populate("updatedBy", "userName email");

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    floors: populatedFloors,
                    summary: {
                        totalInFile: jsonData.length,
                        successfullyCreated: createdFloors.length,
                        failed: creationErrors.length,
                        errors: creationErrors.length > 0 ? creationErrors : undefined
                    }
                },
                `Successfully processed Excel file. Created ${createdFloors.length} floors${creationErrors.length > 0 ? `, ${creationErrors.length} failed` : ''}`
            )
        );

    } catch (error) {
        // Clean up file if it exists and there was an error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to process Excel file: ${error.message}`);
    }
});

export {
    addNewFloor,
    getAllFloor,
    updateFloor,
    deleteFloor,
    addFloorsFromExcel
};