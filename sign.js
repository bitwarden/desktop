exports.default = async function(configuration) {
  console.log(`config:\n${JSON.stringify(configuration, null, 4)}`)

  require("child_process").execSync(
    `azuresigntool sign --help`,
    {
      stdio: "inherit"
    }
  );
};
