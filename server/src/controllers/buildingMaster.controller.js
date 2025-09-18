import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { Building } from '../models/building.model.js';
import * as XLSX from 'xlsx';
import fs from 'fs';

const addNewBuilding = catchAsync(async (req, res) => {
    const { name, status } = req.body;

    if (!name || typeof status !== 'boolean') {
        throw new ApiError(400, 'Name and valid status are required fields');
    }

    const newBuilding = await Building.create({
        name,
        status,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });

    const isBuildingCreate = await Building.findById(newBuilding._id);

    if (!isBuildingCreate) {
        throw new ApiError(500, 'Failed to create Building');
    }

    return res.status(201).json(
        new ApiResponse(201, isBuildingCreate, 'Building created successfully')
    );
});

const getAllBuilding = catchAsync(async (req, res) => {
    const building = await Building.find({isDeleted: false}).sort({ createdAt: -1 });

    if (!building || building.length === 0) {
        throw new ApiError(404, 'No Building available.');
    }

    return res.status(200).json(
        new ApiResponse(200, building, 'Building retrieved successfully')
    );
});

const updateBuilding = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || status == null) {
        throw new ApiError(400, 'Name and status is a required field');
    }

    const updatedBuilding = await Building.findByIdAndUpdate(
        id,
        { name, status, updatedBy: req.user._id },
        { new: true, runValidators: true }
    )
        .populate('createdBy', 'userName')
        .populate('updatedBy', 'userName');

    if (!updatedBuilding) {
        throw new ApiError(404, 'Building not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updatedBuilding, 'Building updated successfully')
    );
});

const deleteBuilding = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'ID is required');
    }

    const deletedBuilding = await Building.findByIdAndUpdate(
        id,
        { isDeleted: true }, 
        { new: true }
    );

    if (!deletedBuilding) {
        throw new ApiError(404, "Building not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedBuilding, 'Building deleted successfully')
    );
});

const addBuildingFromExcel = catchAsync(async (req, res) => {
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

        // Validate and prepare building data
        const buildingsToCreate = [];
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
            const duplicateInBatch = buildingsToCreate.find(dept => 
                dept.name.toLowerCase() === row.name.toString().toLowerCase()
            );
            if (duplicateInBatch) {
                errors.push(`Row ${rowNumber}: Duplicate building name "${row.name}" in Excel file`);
                continue;
            }

            buildingsToCreate.push({
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

        // Check for existing buildings in database (case-insensitive)
        const existingNames = await Building.find({
            name: { 
                $in: buildingsToCreate.map(dept => new RegExp(`^${dept.name}$`, 'i'))
            }
        }).select('name');

        if (existingNames.length > 0) {
            const duplicateNames = existingNames.map(dept => dept.name);
            throw new ApiError(400, `Following building names already exist: ${duplicateNames.join(', ')}`);
        }

        // Create buildings using insertMany for better performance
        let createdBuildings = [];
        let creationErrors = [];

        try {
            createdBuildings = await Building.insertMany(buildingsToCreate, {
                ordered: false // Continue inserting even if some fail
            });
        } catch (error) {
            // Handle bulk insert errors
            if (error.writeErrors && error.writeErrors.length > 0) {
                // Some documents were inserted successfully
                createdBuildings = error.insertedDocs || [];
                creationErrors = error.writeErrors.map((writeError, index) => {
                    const failedDept = buildingsToCreate[writeError.index];
                    return `Failed to create Building "${failedDept.name}": ${writeError.errmsg}`;
                });
            } else {
                // Complete failure
                throw new ApiError(500, `Failed to create buildings: ${error.message}`);
            }
        }

        if (createdBuildings.length === 0) {
            throw new ApiError(500, `Failed to create any buildings. Errors: ${creationErrors.join(', ')}`);
        }

        // Get populated data for response
        const populatedBuildings = await Building.find({
            _id: { $in: createdBuildings.map(dept => dept._id) }
        })
            .populate("createdBy", "userName email")
            .populate("updatedBy", "userName email");

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    buildings: populatedBuildings,
                    summary: {
                        totalInFile: jsonData.length,
                        successfullyCreated: createdBuildings.length,
                        failed: creationErrors.length,
                        errors: creationErrors.length > 0 ? creationErrors : undefined
                    }
                },
                `Successfully processed Excel file. Created ${createdBuildings.length} buildings${creationErrors.length > 0 ? `, ${creationErrors.length} failed` : ''}`
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
    addNewBuilding,
    getAllBuilding,
    updateBuilding,
    deleteBuilding,
    addBuildingFromExcel
};