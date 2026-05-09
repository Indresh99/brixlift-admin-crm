import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
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
  Visited: "secondary",
  Booked: "success",
  Planning: "info",
  Review: "warning",
  "At risk": "error",
};

function DataTable({
  columns,
  rows,
  onRowUpdate,
  rowActions = [],
  pagination,
}) {
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

  const updateDraftValues = (row, values) => {
    setDrafts((current) => ({
      ...current,
      [row.id]: {
        ...row,
        ...current[row.id],
        ...values,
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
    <>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} sx={{ color: "text.secondary", fontWeight: 800 }}>
                  {column.label}
                </TableCell>
              ))}
              {(onRowUpdate || rowActions.length > 0) && (
                <TableCell
                  aria-label="Actions"
                  sx={{
                    position: "sticky",
                    right: 0,
                    zIndex: 2,
                    bgcolor: "background.paper",
                    minWidth: 132,
                    boxShadow: "-8px 0 12px -12px rgba(15, 23, 42, 0.45)",
                  }}
                />
              )}
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
                    const options = column.options || [];
                    const otherValue = column.otherValue || "__other__";
                    const otherSelected = Boolean(draft[`${column.key}OtherSelected`]);
                    const optionValues = options.map((option) => String(option.value ?? option));
                    const selectOptions =
                      value && !otherSelected && !optionValues.includes(String(value))
                        ? [{ value, label: value }, ...options]
                        : options;

                    return (
                      <TableCell
                        key={column.key}
                        sx={{
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth,
                          verticalAlign: column.multiline ? "top" : "middle",
                          whiteSpace: column.multiline ? "normal" : undefined,
                          wordBreak: column.multiline ? "break-word" : undefined,
                        }}
                      >
                        {renderedValue !== undefined ? (
                          renderedValue
                        ) : column.editable && column.options ? (
                          <>
                            <Select
                              value={otherSelected ? otherValue : value || ""}
                              size="small"
                              onChange={(event) => {
                                if (event.target.value === otherValue) {
                                  updateDraftValues(row, {
                                    [column.key]: "",
                                    [`${column.key}OtherSelected`]: true,
                                  });
                                  return;
                                }
                                updateDraftValues(row, {
                                  [column.key]: event.target.value,
                                  [`${column.key}OtherSelected`]: false,
                                });
                              }}
                              sx={{ minWidth: 120 }}
                            >
                              {selectOptions.map((option) => (
                                <MenuItem key={option.value ?? option} value={option.value ?? option}>
                                  {option.label ?? option}
                                </MenuItem>
                              ))}
                              {column.allowOther && (
                                <MenuItem value={otherValue}>Other</MenuItem>
                              )}
                            </Select>
                            {column.allowOther && otherSelected && (
                              <TextField
                                value={value || ""}
                                placeholder={column.otherPlaceholder || "Enter value"}
                                size="small"
                                fullWidth
                                sx={{ mt: 1 }}
                                onChange={(event) => updateDraft(row, column.key, event.target.value)}
                              />
                            )}
                          </>
                        ) : column.editable ? (
                          <TextField
                            value={value || ""}
                            size="small"
                            fullWidth={Boolean(column.multiline)}
                            multiline={Boolean(column.multiline)}
                            minRows={column.minRows}
                            maxRows={column.maxRows}
                            slotProps={{ htmlInput: { inputMode: column.inputMode } }}
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
                    <TableCell
                      align="right"
                      sx={{
                        position: "sticky",
                        right: 0,
                        zIndex: 1,
                        bgcolor: "background.paper",
                        minWidth: 132,
                        whiteSpace: "nowrap",
                        boxShadow: "-8px 0 12px -12px rgba(15, 23, 42, 0.45)",
                      }}
                    >
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
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.count}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={pagination.onPageChange}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
        />
      )}
    </>
  );
}

export default DataTable;
