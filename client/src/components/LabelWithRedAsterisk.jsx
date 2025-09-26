import { Typography } from '@mui/material'

const LabelWithRedAsterisk = ({ children, required = false }) => {
  return (
    <Typography
      variant="body2"
      component="label"
      sx={{ fontWeight: 600, display: "inline-flex", alignItems: "center" }}
    >
      {children}
      {required && (
        <span style={{ color: "red", marginLeft: "2px" }}>*</span>
      )}
    </Typography>
  )
}

export default LabelWithRedAsterisk
