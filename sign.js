exports.default = async function(configuration) {
  //console.log(`config:\n${JSON.stringify(configuration, null, 4)}`)
  console.log(`env test - secret test ${process.env.secretTest}`)

  require("child_process").execSync(
    `azuresigntool sign -kvu ${process.env.SigningVaultURL} -kvi ${process.env.SigningClientId} -kvs ${process.env.SigningClientSecret} -kvc ${process.env.SigningCertName} -fd ${configuration.hash}-du ${configuration.site} -tr http://timestamp.digicert.com ${configuration.path}`,
    {
      stdio: "inherit"
    }
  );
};
