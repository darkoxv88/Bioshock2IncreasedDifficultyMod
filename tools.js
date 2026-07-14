(() => {
  const openBracked = '(';
  const closeBracked = ')';

  async function copyToClipboard(text) {
    try 
    {
      await navigator.clipboard.writeText(text);
    } 
    catch (err) 
    {
      console.error('Failed to copy: ', err);
    }
  }

  class VendorItem {
    constructor(className, pickupName, costMultiplier) {
      this.className = className;
      this.pickupName = pickupName;
      this.costMultiplier = typeof(costMultiplier) === 'number' ? costMultiplier : 1;
    }

    readStackSize(line) {
      return line.split('StackSize=')[1].split(',')[0];
    }

    readSupplySize(line) {
      if (!line.includes('SupplySize=')) {
        return '';
      }

      return ', SupplySize=' + line.split('SupplySize=')[1].split(',')[0].split(closeBracked)[0];
    }

    create(line) {
      const globalCostMultiplier = 1.2;
      const hacked = line.includes('DisplayWhenHacked=True');
      const cost = (((hacked ? 0.8 : 1) * globalCostMultiplier) * this.costMultiplier).toFixed(3);
      const displayWhenUnHacked = hacked ? 'False' : 'True';
      const displayWhenHacked = hacked ? 'True' : 'False';

      return `VendingLootSpec=(ItemClass=class'${this.className}', PickupClass=class'${this.pickupName}', StackSize=${this.readStackSize(line)}`
        + `, CostAdjustment=${cost}, DisplayWhenUnHacked=${displayWhenUnHacked}, DisplayWhenHacked=${displayWhenHacked}`
        + this.readSupplySize(line) 
        + ')';
    }
  }

  const vendorItems = {
    'ShockDesignerClasses.MedHypo': new VendorItem('ShockDesignerClasses.MedHypo', 'Pickups.MedHypo_Pickup', 1.1),
    'ShockDesignerClasses.BioAmmoHypo': new VendorItem('ShockDesignerClasses.BioAmmoHypo', 'Pickups.EveHypo_Pickup', 1.1),
    'ShockGame.Drill_Ammo': new VendorItem('ShockGame.Drill_Ammo', 'Pickups.DrillAmmo_Pickup', 1.0),
    'ShockGame.Rivet_Ammo': new VendorItem('ShockGame.Rivet_Ammo', 'Pickups.StandardRivet_Pickup', 1.0),
    'ShockGame.Rivet_MagnumAmmo': new VendorItem('ShockGame.Rivet_MagnumAmmo', 'Pickups.HighPowerRivet_Pickup', 1.0),
    'ShockGame.Rivet_TrapAmmo': new VendorItem('ShockGame.Rivet_TrapAmmo', 'Pickups.TrapRivet_Pickup', 1.0),
    'ShockGame.Hacking_Ammo': new VendorItem('ShockGame.Hacking_Ammo', 'Pickups.HackAmmo_Pickup', 1.0),
    'ShockGame.Hacking_AutoHackAmmo': new VendorItem('ShockGame.Hacking_AutoHackAmmo', 'Pickups.AutoHackAmmo_Pickup', 1.0),
    'ShockGame.Hacking_TurretAmmo': new VendorItem('ShockGame.Hacking_TurretAmmo', 'Pickups.TurretAmmo_Pickup', 1.0),
    'ShockGame.MachineGun_Bullet': new VendorItem('ShockGame.MachineGun_Bullet', 'Pickups.SMG40Cal_Pickup', 1.0),
    'ShockGame.MachineGun_AntiPersonnelBullet': new VendorItem('ShockGame.MachineGun_AntiPersonnelBullet', 'Pickups.SMGAntiPersonnel_Pickup', 1.0),
    'ShockGame.MachineGun_ArmorPiercingBullet': new VendorItem('ShockGame.MachineGun_ArmorPiercingBullet', 'Pickups.SMGArmorPiercing_Pickup', 1.0),
    'ShockGame.Shotgun_00Buck': new VendorItem('ShockGame.Shotgun_00Buck', 'Pickups.00Buck_Pickup', 1.0),
    'ShockGame.Shotgun_PhosphorusBuck': new VendorItem('ShockGame.Shotgun_PhosphorusBuck', 'Pickups.PhosphorusBuck_Pickup', 1.0),
    'ShockGame.Shotgun_SolidSlug': new VendorItem('ShockGame.Shotgun_SolidSlug', 'Pickups.SolidSlug_Pickup', 1.0),
    'ShockGame.Speargun_Spear': new VendorItem('ShockGame.Speargun_Spear', 'Pickups.StandardSpear_Pickup', 1.0),
    'ShockGame.Speargun_RocketSpearAmmo': new VendorItem('ShockGame.Speargun_RocketSpearAmmo', 'Pickups.RocketSpear_Pickup', 1.0),
    'ShockGame.Speargun_TrapSpearAmmo': new VendorItem('ShockGame.Speargun_TrapSpearAmmo', 'Pickups.TrapSpear_Pickup', 1.0),
    'ShockGame.GrenadeLauncher_FragGrenade': new VendorItem('ShockGame.GrenadeLauncher_FragGrenade', 'Pickups.FragGrenade_Pickup', 1.0),
    'ShockGame.GrenadeLauncher_StickyGrenade': new VendorItem('ShockGame.GrenadeLauncher_StickyGrenade', 'Pickups.StickyGrenade_Pickup', 1.0),
    'ShockGame.GrenadeLauncher_RPG': new VendorItem('ShockGame.GrenadeLauncher_RPG', 'Pickups.RPG_Pickup', 1.0),
  };

  function handleVendorItem(line) {
    if (!line.includes('VendingLootSpec=')) {
      return line;
    } 

    for (let item in vendorItems) {
      if (!line.includes(item)) {
        continue;
      }

      return vendorItems[item].create(line);
    }

    return line;
  }

  document.getElementById('file').onchange = function() {
    const output = document.getElementById('output')
    const file = this.files[0];

    const reader = new FileReader();
    reader.onload = async function(progressEvent) {
      const lines = this.result.split('\n');

      for (var line = 0; line < lines.length; line++) {
        lines[line] = handleVendorItem(lines[line]);
      }

      const edited = lines.join('\n');

      copyToClipboard(edited);
      output.innerHTML = edited;
    };

    reader.readAsText(file);
  }
})();
