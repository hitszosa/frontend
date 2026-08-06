{
  lib,
  bun2nix,
  app ? "mirrors",
  ...
}:
bun2nix.mkDerivation {
  pname = "hitszosa-frontend-${app}";
  version = "0-unstable";

  packageJson = ./package.json;

  src = lib.cleanSource ./.;

  bunDeps = bun2nix.fetchBunDeps {
    bunNix = ./bun.nix;
  };

  dontUseBunBuild = true;

  buildPhase = ''
    runHook preBuild
    bun run build:${app}
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p "$out"
    cp -R apps/${app}/dist/. "$out/"
    runHook postInstall
  '';
}
