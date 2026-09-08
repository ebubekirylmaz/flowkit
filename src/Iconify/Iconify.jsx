import Box from "@mui/material/Box";
import { Icon } from "@iconify/react";
import React from "react";
import { forwardRef } from "react";

const Iconify = forwardRef(({ icon, width = 20, sx, ...other }, ref) => (
  <Box
    ref={ref}
    component={Icon}
    className="component-iconify"
    icon={icon}
    sx={{ width, height: width, ...sx }}
    {...other}
  />
));

export default Iconify;
