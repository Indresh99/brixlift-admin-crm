import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useState } from "react";

const statusColors = {
  Active: "success",
  Closed: "success",
  Hot: "error",
  Warm: "warning",
  New: "info",
  Planning: "info",
  Review: "warning",
  "At risk": "error",
};

function DataTable({ columns, rows, onRowUpdate, rowActions = [] }) {
  const [drafts, setDrafts] = useState({});
  const [savedRows, setSavedRows] = useState({});

  const updateDraft = (row, key, value) => {
    setDrafts((current) => ({
      ...current,
      [row.id]: {
        ...row,
        ...current[row.id],
        [key]: value,
      },
    }));
  };

  const saveDraft = async (row) => {
    const draft = drafts[row.id];
    if (!draft || !onRowUpdate) return;

    const updated = await onRowUpdate(row.id, draft);
    setSavedRows((current) => ({ ...current, [row.id]: updated }));
    setDrafts((current) => {
      const next = { ...current };
      delete next[row.id];
      return next;
    });
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} sx={{ color: "text.secondary", fontWeight: 800 }}>
                {column.label}
              </TableCell>
            ))}
            {(onRowUpdate || rowActions.length > 0) && <TableCell aria-label="Actions" />}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((originalRow) => {
            const row = { ...originalRow, ...savedRows[originalRow.id] };

            return (
              <TableRow key={row.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
              {columns.map((column) => {
                const draft = drafts[row.id] || row;
                const value = draft[column.key];
                const renderedValue = column.render?.(value, draft);

                return (
                  <TableCell key={column.key}>
                    {renderedValue !== undefined ? (
                      renderedValue
                    ) : column.editable && column.options ? (
                      <Select
                        value={value || ""}
                        size="small"
                        onChange={(event) => updateDraft(row, column.key, event.target.value)}
                        sx={{ minWidth: 120 }}
                      >
                        {column.options.map((option) => (
                          <MenuItem key={option.value ?? option} value={option.value ?? option}>
                            {option.label ?? option}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : column.editable ? (
                      <TextField
                        value={value || ""}
                        size="small"
                        inputProps={{ inputMode: column.inputMode }}
                        onChange={(event) => updateDraft(row, column.key, event.target.value)}
                      />
                    ) : column.key === "status" ? (
                      <Chip
                        label={value}
                        color={statusColors[value] || "default"}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      value
                    )}
                  </TableCell>
                );
              })}
              {(onRowUpdate || rowActions.length > 0) && (
                <TableCell align="right">
                  {rowActions.map((action) => (
                    <Tooltip key={action.label} title={action.label}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => action.onClick(row)}
                          disabled={action.disabled?.(row)}
                          aria-label={action.label}
                        >
                          {action.icon}
                        </IconButton>
                      </span>
                    </Tooltip>
                  ))}
                  {onRowUpdate && (
                    <Tooltip title="Save row">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => saveDraft(row)}
                          disabled={!drafts[row.id]}
                          aria-label="Save row"
                        >
                          <SaveRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
