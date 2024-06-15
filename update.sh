# Description: Update the system with the latest changes from the flake.
echo "# Please enter your password for sudo command: "
read -s password
echo "# Updating flake.lock"
nix flake update
echo "# Updating home-manager"
home-manager switch
echo "# Rebuilding system"
echo $password | sudo -S nixos-rebuild switch --flake .
