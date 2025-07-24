import * as React from "react";
import { Typography } from "@mui/material";
import { createComponent } from "@mui/toolpad/browser";

export interface DarkModeSyncProps {
  msg: string;
}

function DarkModeSync({ msg }: DarkModeSyncProps) {
  return <Typography>{msg}</Typography>;
}

export default createComponent(DarkModeSync, {
  argTypes: {
    msg: {
      type: "string",
      default: "Hello world!",
    },
  },
});
