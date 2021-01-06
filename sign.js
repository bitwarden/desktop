exports.default = async function(configuration) {
  require("child_process").execSync(
    `azuresigntool sign ` +
    `-kvu ${process.env.SIGNING_VAULT_URL} ` +
    `-kvi ${process.env.SIGNING_CLIENT_ID} ` +
    `-kvt ${process.env.SIGNING_TENANT_ID} ` +
    `-kvs ${process.env.SIGNING_CLIENT_SECRET} ` +
    `-kvc ${process.env.SIGNING_CERT_NAME} ` +
    `-fd ${configuration.hash} ` +
    `-du ${configuration.site} ` +
    `-tr http://timestamp.digicert.com ` +
    `${configuration.path}`,
    {
      stdio: "inherit"
    }
  );
};
