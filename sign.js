exports.default = async function(configuration) {
  console.log(`config:\n${JSON.stringify(configuration)}`)

  require("child_process").execSync(
    `echo 'Heyo!'`,
    {
      stdio: "inherit"
    }
  );
};
