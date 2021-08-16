import React from "react";
import ImportPage from "../../react/components/ImportPage";
import ReactWrapper, { reactWrapperProps } from "../react-wrapper";

// wrap original ImportPage component into
const ImportPageWrapper = ({ reactWrapperProps }) => {
  return (
    <ReactWrapper reactWrapperProps={reactWrapperProps}>
      <ImportPage></ImportPage>
    </ReactWrapper>
  );
};

ImportPageWrapper.propTypes = {
  reactWrapperProps: reactWrapperProps.isRequired
}

export default ImportPageWrapper;
