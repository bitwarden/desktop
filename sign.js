exports.default = async function(configuration) {
  console.log(`config:\n${JSON.stringify(configuration, null, 4)}`)

  require("child_process").execSync(
    `azuresigntool sign \
    -kvu "${process.env.SigningVaultURL}" \
    -kvi "${process.env.SigningClientId}" \ 
    -kvs "${process.env.SigningClientSecret}" \
    -kvc "${process.env.SigningCertName}" \
    -tr http://timestamp.digicert.com \
    ${configuration.path}`,
    {
      stdio: "inherit"
    }
  );
};
