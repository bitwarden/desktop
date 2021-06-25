import React from "react";
import ImportPage from "../../react/components/ImportPage";
import ReactWrapper from "../react-wrapper";

// wrap original ImportPage component into
const ImportPageWrapper = ({ client, bitwardenData, ...props }) => {
  return (
    <ReactWrapper client={client} bitwardenData={bitwardenData} {...props}>
      <ImportPage></ImportPage>
    </ReactWrapper>
  );
};

export default ImportPageWrapper;
