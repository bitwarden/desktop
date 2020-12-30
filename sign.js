exports.default = async function(configuration) {

  require("child_process").execSync(
    `echo
    "${configuration}"
    `,
    {
      stdio: "inherit"
    }
  );
};
