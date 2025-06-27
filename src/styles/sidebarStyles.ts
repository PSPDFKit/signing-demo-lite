export const sidebarStyles = {
  section: {
    padding: "16px",
    borderBottom: "1px solid #D7DCE4",
  },
  
  sectionTitle: {
    fontFamily: "Inter",
    fontSize: "12px",
    fontWeight: "600" as const,
    lineHeight: "20px",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  },
  
  sectionDescription: {
    fontFamily: "Inter",
    fontSize: "10px",
    fontWeight: "400" as const,
    lineHeight: "14px",
    marginBottom: "10px",
  },
  
  highlight: {
    fontWeight: "bolder" as const,
  },

  // Field styles
  draggableField: {
    margin: "15px 0px",
    padding: "0rem 0px",
    cursor: "move" as const,
  },

  fieldIcon: {
    border: "1px solid #d7dce4",
    borderRadius: "5px",
    marginInlineEnd: "8px",
    padding: "3px 5px",
  },

  fieldLabel: {
    margin: "0px 0.5rem",
  },
} as const;