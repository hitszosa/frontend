{
  description = "HITSZ OSA frontend flake";

  inputs = {
    self.submodules = true;

    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };

    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  nixConfig = {
    extra-substituters = [
      "https://nix-community.cachix.org"
      "https://hitszosa.cachix.org"
    ];
    extra-trusted-public-keys = [
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
      "hitszosa.cachix.org-1:jszO2bo2i2x0/eRn5ZbvU72eFjyFM4kmSEdkVMqOpac="
    ];
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "aarch64-linux"
        "x86_64-linux"
      ];

      perSystem =
        { system, pkgs, ... }:
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [
              inputs.bun2nix.overlays.default
            ];
            config = { };
          };
          devShells = {
            default = pkgs.mkShell {
              packages = with pkgs; [
                bun
              ];

              shellHook = ''
                bun install --frozen-lockfile
              '';
            };
          };
          packages = {
            landing = pkgs.callPackage ./default.nix { app = "landing"; };
            mirrors = pkgs.callPackage ./default.nix { app = "mirrors"; };
          };
        };
    };
}
