(() => {
  const openBracked = '(';
  const closeBracked = ')';
  const openSquareBracked = '[';
  const closeSquareBracked = ']';

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

  class GroupIdRef {
    constructor() {
      this.id = '';
    }

    get() {
      return this.id;
    }

    set(id) {
      this.id = (typeof id === 'string') ? id : '';
    }

    detect(line) {
      if (!line.includes(openSquareBracked)) {
        return;
      }

      this.set(line.split(openSquareBracked)[1].split(closeSquareBracked)[0]);
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
      const globalCostMultiplier = 1.5;
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
    'ShockDesignerClasses.MedHypo': new VendorItem('ShockDesignerClasses.MedHypo', 'Pickups.MedHypo_Pickup', 1.15),
    'ShockDesignerClasses.BioAmmoHypo': new VendorItem('ShockDesignerClasses.BioAmmoHypo', 'Pickups.EveHypo_Pickup', 1.15),
    
    // Ammo
    'ShockGame.Drill_Ammo': new VendorItem('ShockGame.Drill_Ammo', 'Pickups.DrillAmmo_Pickup', 1.0),
    'ShockGame.Rivet_Ammo': new VendorItem('ShockGame.Rivet_Ammo', 'Pickups.StandardRivet_Pickup', 1.0),
    'ShockGame.Rivet_MagnumAmmo': new VendorItem('ShockGame.Rivet_MagnumAmmo', 'Pickups.HighPowerRivet_Pickup', 1.0),
    'ShockGame.Rivet_TrapAmmo': new VendorItem('ShockGame.Rivet_TrapAmmo', 'Pickups.TrapRivet_Pickup', 1.0),
    'ShockGame.Hacking_Ammo': new VendorItem('ShockGame.Hacking_Ammo', 'Pickups.HackAmmo_Pickup', 1.2),
    'ShockGame.Hacking_AutoHackAmmo': new VendorItem('ShockGame.Hacking_AutoHackAmmo', 'Pickups.AutoHackAmmo_Pickup', 1.1),
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

    // Consumables
    'Pickups.FreshWaterPickupItem': new VendorItem('Pickups.FreshWaterPickupItem', 'Pickups.FreshWater_Pickup', 1.1),
    'Pickups.VitaminsPickupItem': new VendorItem('Pickups.VitaminsPickupItem', 'Pickups.Vitamins_Pickup', 1.1),
    'Pickups.DrHollcroftsCureAllPickupItem': new VendorItem('Pickups.DrHollcroftsCureAllPickupItem', 'Pickups.DrHollcroftsCureAll_Pickup', 1.1),
    'Pickups.PottedMeatPickupItem': new VendorItem('Pickups.PottedMeatPickupItem', 'Pickups.PottedMeat_Pickup', 1.1),
    'Pickups.AspirinPickupItem': new VendorItem('Pickups.AspirinPickupItem', 'Pickups.Aspirin_Pickup', 1.1),
    'Pickups.SodaPickupItem': new VendorItem('Pickups.SodaPickupItem', 'Pickups.Soda_Pickup', 1.1),
    'Pickups.TwinkiePickupItem': new VendorItem('Pickups.TwinkiePickupItem', 'Pickups.Twinkie1_Pickup', 1.1),
    'Pickups.CannedFruitPickupItem': new VendorItem('Pickups.CannedFruitPickupItem', 'Pickups.CannedFruit_Pickup', 1.1),
    'Pickups.PowerbarPickupItem': new VendorItem('Pickups.PowerbarPickupItem', 'Pickups.Powerbar1_Pickup', 1.1),
    'Pickups.SardinesPickupItem': new VendorItem('Pickups.SardinesPickupItem', 'Pickups.Sardines_Pickup', 1.1),
    'Pickups.CannedBeansPickupItem': new VendorItem('Pickups.CannedBeansPickupItem', 'Pickups.CannedBeans_Pickup', 1.1),
    'Pickups.CoffeePickupItem': new VendorItem('Pickups.CoffeePickupItem', 'Pickups.Coffee_Pickup', 1.1),
    'Pickups.ChipsPickupItem': new VendorItem('Pickups.ChipsPickupItem', 'Pickups.Chips_Pickup', 1.1),
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

  function handleHackingSpeed(line) {
    const addValue = 3;

    if (!line.includes('CursorSpeed=')) {
      return line;
    } 

    const speedValue = parseInt(line.split('CursorSpeed=')[1]) + addValue;

    return 'CursorSpeed=' + speedValue.toString();
  }

  class ResistanceType {
    constructor(type, resistanceMultiplier, applyChanceMultiplier) {
      this.type = type;
      this.resistanceMultiplier = (typeof resistanceMultiplier === 'number') ? resistanceMultiplier : 1;
      this.applyChanceMultiplier = (typeof applyChanceMultiplier === 'number') ? applyChanceMultiplier : 1;
      Object.freeze(this);
    }
  }

  const fallingResistances = {
    'STIMULUS_Falling': new ResistanceType('STIMULUS_Falling'),
    'STIMULUS_AIFalling': new ResistanceType('STIMULUS_AIFalling'),
  }

  const physicalResistances = {
    'STIMULUS_AIGenericPiercing': new ResistanceType('STIMULUS_AIGenericPiercing'),
    'STIMULUS_AIArmorPiercing': new ResistanceType('STIMULUS_AIArmorPiercing'),
    'STIMULUS_AIAntiPersonnel': new ResistanceType('STIMULUS_AIAntiPersonnel'),
    'STIMULUS_AIBludgeoning': new ResistanceType('STIMULUS_AIBludgeoning'),
    'STIMULUS_AIExplosive': new ResistanceType('STIMULUS_AIExplosive'),
    'STIMULUS_AIDrill': new ResistanceType('STIMULUS_AIDrill'),
    'STIMULUS_AIDaddyDash': new ResistanceType('STIMULUS_AIDaddyDash'),
  }

  const elementalResistances = {
    'STIMULUS_AIHeat': new ResistanceType('STIMULUS_AIHeat'),
    'STIMULUS_AICold': new ResistanceType('STIMULUS_AICold'),
    'STIMULUS_AIElectric': new ResistanceType('STIMULUS_AIElectric'),
    'STIMULUS_Burning': new ResistanceType('STIMULUS_Burning'),
    'STIMULUS_BurningTime': new ResistanceType('STIMULUS_BurningTime'),
    'STIMULUS_Diseased': new ResistanceType('STIMULUS_Diseased'),
    'STIMULUS_ElectricInWater': new ResistanceType('STIMULUS_ElectricInWater'),
  }

  const stunResistances = {
    'STIMULUS_Shocked': new ResistanceType('STIMULUS_Shocked'),
    'STIMULUS_Frozen': new ResistanceType('STIMULUS_Frozen'),
    'STIMULUS_ShockedInWater': new ResistanceType('STIMULUS_ShockedInWater'),
  }

  const enragedResistances = {
    'STIMULUS_Berserk': new ResistanceType('STIMULUS_Berserk'),
    'STIMULUS_LatentBerserk': new ResistanceType('STIMULUS_LatentBerserk'),
  }

  const securityCommandResistances = {
    'STIMULUS_SecurityBeacon': new ResistanceType('STIMULUS_SecurityBeacon', 1),
    'STIMULUS_SecurityBeaconAdvanced': new ResistanceType('STIMULUS_SecurityBeaconAdvanced', 1),
    'STIMULUS_SecurityBeaconMaster': new ResistanceType('STIMULUS_SecurityBeaconMaster', 1),
  }

  const allResistanceTypes = {
    ...fallingResistances,
    ...physicalResistances,
    ...elementalResistances,
    ...stunResistances,
    ...enragedResistances,
    ...securityCommandResistances,
  }

  class ResistanceGroup {
    constructor(className) {
      this.className = className;
    }

    readResistanceType(line) {
      if (!line.includes('Resistance=')) {
        return '';
      }

      return line.split('Type=')[1].split(',')[0];
    }

    readAmountModification(line) {
      return parseFloat(line.split('AmountModification=')[1].split(',')[0].split(closeBracked)[0]);
    }

    readChanceMultiplier(line) {
      return parseFloat(line.split('ChanceModification=')[1].split(',')[0].split(closeBracked)[0]);
    }

    create(line) {
      const toModify = securityCommandResistances;
      const resistanceMultiplier = 1;
      const applyChanceMultiplier = 1;
      
      const resistanceType = this.readResistanceType(line);

      if (!(resistanceType in toModify)) {
        return line;
      }

      const resistanceTypeRef = toModify[resistanceType];

      return 'Resistance=(Type='
        + resistanceType
        + ',AmountModification='
        + (this.readAmountModification(line) * resistanceMultiplier * resistanceTypeRef.resistanceMultiplier).toFixed(4)
        + ',ChanceModification='
        + (this.readChanceMultiplier(line) * applyChanceMultiplier * resistanceTypeRef.applyChanceMultiplier).toFixed(4)
        + closeBracked;
    }
  }

  const allResistanceGroups = {
    'HumanAggressorResistanceSetEasy': new ResistanceGroup('HumanAggressorResistanceSetEasy'),
    'HumanAggressorResistanceSet': new ResistanceGroup('HumanAggressorResistanceSet'),
    'HumanAggressorNoFreezeResistanceSet': new ResistanceGroup('HumanAggressorNoFreezeResistanceSet'),
    'HumanAggressorHardResistanceSet': new ResistanceGroup('HumanAggressorHardResistanceSet'),
    'MeleeThugResistanceSet': new ResistanceGroup('MeleeThugResistanceSet'),
    'CeilingCrawlerResistanceSet': new ResistanceGroup('CeilingCrawlerResistanceSet'),
    'AssassinResistanceSet': new ResistanceGroup('AssassinResistanceSet'),
    'BruteResistanceSet': new ResistanceGroup('BruteResistanceSet'),
    'SecurityBotResistanceSet': new ResistanceGroup('SecurityBotResistanceSet'),
    'TurretResistanceSet': new ResistanceGroup('TurretResistanceSet'),
    'CameraResistanceSet': new ResistanceGroup('CameraResistanceSet'),
    'MadDaddyResistanceSet': new ResistanceGroup('MadDaddyResistanceSet'),
    'EdenDaddyResistanceSet': new ResistanceGroup('EdenDaddyResistanceSet'),
    'BouncerResistanceSet': new ResistanceGroup('BouncerResistanceSet'),
    'EliteBouncerResistanceSet': new ResistanceGroup('EliteBouncerResistanceSet'),
    'RosieResistanceSet': new ResistanceGroup('RosieResistanceSet'),
    'EliteRosieResistanceSet': new ResistanceGroup('EliteRosieResistanceSet'),
    'SloProFumResistanceSet': new ResistanceGroup('SloProFumResistanceSet'),
    'BigSisterPreludeResistanceSet': new ResistanceGroup('BigSisterPreludeResistanceSet'),
    'BigSisterResistanceSet': new ResistanceGroup('BigSisterResistanceSet'),
    'PreacherResistanceSet': new ResistanceGroup('PreacherResistanceSet'),
  }

  function handleResistances(line, group) {
    if (!(group.get() in allResistanceGroups)) {
      return line;
    }

    return allResistanceGroups[group.get()].create(line);
  }

  class FileHandler {
    constructor(file) {
      this.reader = new FileReader();
      this.reader.onload = () => this.handle(this.reader.result.split('\n'));
      this.reader.readAsText(file);
      this.handleVendorItem = handleVendorItem;
      this.handleHackingSpeed = handleHackingSpeed;
      this.handleResistances = handleResistances;
    }

    handle(lines) {
      const targetId = new GroupIdRef();

      for (var line = 0; line < lines.length; line++) {
        targetId.detect(lines[line]);
        lines[line] = this.handleVendorItem(lines[line], targetId);
      }

      const edited = lines.join('\n');
      document.getElementById('output').innerHTML = edited;
      copyToClipboard(edited);
    }
  }

  document.getElementById('file').onchange = function() {
    const handler = new FileHandler(this.files[0]);
  }
})();
