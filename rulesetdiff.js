const gconstTableBody = document.getElementById('gconstTable').getElementsByTagName('tbody')[0];
const dpsTableBody = document.getElementById('dpsTable').getElementsByTagName('tbody')[0];
const fileSelect1 = document.getElementById('fileSelect1');
const fileSelect2 = document.getElementById('fileSelect2');
const showDefaults = document.getElementById('showDefaults');
const convertToNumbers = document.getElementById('convertToNumbers');
const roundNumbers = document.getElementById('roundNumbers');
const saveButton1 = document.getElementById('saveButton1');
const saveButton2 = document.getElementById('saveButton2');
const changelog = document.getElementById('changelog');

convertToNumbers.checked = true;
roundNumbers.checked = true;
saveButton1.disabled = true;
saveButton2.disabled = true;

fileSelect1.addEventListener('change', (event) => selectFile(1, event.currentTarget, saveButton1));
fileSelect2.addEventListener('change', (event) => selectFile(2, event.currentTarget, saveButton2));
showDefaults.addEventListener('change', () => toggleDefaults());
convertToNumbers.addEventListener('change', () => toggleRounding());
roundNumbers.addEventListener('change', () => toggleRounding());
saveButton1.addEventListener('click', () => saveRuleset(1, fileSelect1));
saveButton2.addEventListener('click', () => saveRuleset(2, fileSelect2));

let ruleset = {};

function countDecimals(num)
{
  if(num === undefined)
    return 0;

  const numStrs = num.toString().split('.');
  if(numStrs.length < 2)
    return 0;

  return numStrs[1].length;
}

function formatNumber(num, decimals)
{
  if(!convertToNumbers.checked)
    return num;

  num = Number(num);
  return roundNumbers.checked && decimals ? num.toFixed(decimals) : num;
}

function calculateDPS(damage, reload, pellets = 1)
{
  return Number(pellets) * Number(damage) * 1000 / Number(reload);
}

function getPellets(groupName, num)
{
  if(groupName == 'burstgun')
  {
    if(num !== undefined && ruleset[num].hasOwnProperty('gconst_burstgun_burstsegments'))
      return Number(ruleset[num]['gconst_burstgun_burstsegments']) + 1;
    else
      return Number(rulesetDefault['gconst_burstgun_burstsegments']) + 1;
  }
  else if(groupName == 'shotgun')
  {
    return 19;
  }
  return 1;
}

function parseRuleset(rulesetStr)
{
  let rulesetVars = {};
  for(let line of rulesetStr.split('\n'))
  {
    line = line.trim();
    if(line.length > 0 && line.substring(0, 7) == 'gconst_')
    {
      line = line.split(' ');
      rulesetVars[line[0]] = line[1];
    }
  }
  return rulesetVars;
}

function isWeaponGroupName(varOrGroupName)
{
  const weaponGroupNames = new Set(['melee', 'burstgun', 'shotgun', 'grenadelauncher', 'plasmarifle', 'rocketlauncher', 'ioncannon', 'boltrifle', 'stake']);
  return weaponGroupNames.has(varOrGroupName);
}

function rowChange(row, groupChanges, nameAppend = '')
{
  const diffCell = row.getElementsByClassName('diff')[0];
  if(diffCell.innerText == '')
    return;

  const varOrGroupName = row.getElementsByClassName('variable')[0].innerText;
  const diffval1 = row.getElementsByClassName('val1')[0].innerText;
  const diffVal2 = row.getElementsByClassName('val2')[0].innerText;

  const name = clearNames[varOrGroupName];
  switch(varOrGroupName)
  {
    case 'gconst_player_isbullet':
      const shape = ['Pill', 'Bullet'];
      groupChanges.push(`${name} changed from ${shape[+(diffval1 != '0')]} to ${shape[+(diffVal2 != '0')]}\n`);
      break;
    case 'gconst_expose_timers_to_lua':
    case 'gconst_powerups_drop':
    case 'gconst_wallclipping':
    case 'gconst_stakelauncher_enabled':
      groupChanges.push(`${name} ${diffCell.innerText != '0' ? 'enabled' : 'disabled'}\n`);
      break;
    default:
      let diff = Number(diffCell.innerText);
      let type = 'decreased';
      let sign = '-';
      if(diff > 0)
      {
        type = 'increased';
        sign = '+';
      }
      diff = 100 * diff / Number(diffval1);
      const decimals = Math.min(countDecimals(diff), 2);
      diff = Math.abs(diff.toFixed(decimals));
      groupChanges.push(`${name}${nameAppend} ${type} from ${diffval1} to ${diffVal2} (${sign}${diff}%)\n`);
  }
}

function generateChangelog()
{
  if(!fileSelect1.files[0] || !fileSelect2.files[0])
    return;

  const rulesetName1 = fileSelect1.files[0].name.slice(8, -4);
  const rulesetName2 = fileSelect2.files[0].name.slice(8, -4);
  changelog.value = `Changes from ${rulesetName1} to ${rulesetName2}:\n\n`;
  for(const group of gconstGroups)
  {
    let groupChanges = [];
    for(const varName of group.variables)
    {
      const gconstRow = gconstTableBody.getElementsByClassName(varName)[0];
      rowChange(gconstRow, groupChanges);
    }

    if(group.hasOwnProperty('damage') && group.hasOwnProperty('reload'))
    {
      const dpsRow = dpsTableBody.getElementsByClassName(group.name)[0];
      rowChange(dpsRow, groupChanges, ' DPS');
    }

    if(groupChanges.length)
      changelog.value += groupChanges.join('') + '\n';
  }
}

function updateDiffCell(row, fromVal, toVal, resetOnly, decimals)
{
  const diffCell = row.getElementsByClassName('diff')[0];
  diffCell.classList.remove('negative', 'positive');
  diffCell.innerText = '';

  if(resetOnly)
    return;

  const diff = Number(toVal) - Number(fromVal);
  if(diff == 0)
    return;

  let type = 'negative';
  let sign = '-';
  if(diff > 0)
  {
    type = 'positive';
    sign = '+';
  }

  diffCell.classList.add(type);
  diffCell.innerText = `${sign}${formatNumber(Math.abs(diff), decimals)}`;
}

function updateRow(num, row, newVal, defaultVal, minDecimals = 0)
{
  const varCell = row.getElementsByClassName('variable')[0];
  const valCell0 = row.getElementsByClassName('val0')[0];
  const valCell1 = row.getElementsByClassName(`val${num}`)[0];
  const valCell2 = row.getElementsByClassName(`val${num % 2 + 1}`)[0];

  let newValNum = null;
  if(newVal !== undefined && newVal !== null)
  {
    newValNum = formatNumber(newVal);
    valCell1.classList.remove('unset');
  }
  else
  {
    newValNum = formatNumber(defaultVal);
    valCell1.classList.add('unset');
  }

  if(valCell1.classList.contains('unset') || valCell2.classList.contains('unset'))
    valCell0.classList.remove('unset');
  else
    valCell0.classList.add('unset');

  let decimals = Math.max(countDecimals(newValNum), countDecimals(valCell2.innerText));
  if(isWeaponGroupName(varCell.innerText))
    decimals = Math.min(decimals, 2);
  decimals = Math.max(decimals, minDecimals);

  valCell1.innerText = formatNumber(newValNum, decimals);

  const resetOnly = valCell2.innerText == '';
  if(!resetOnly)
    valCell2.innerText = formatNumber(valCell2.innerText, decimals);

  if(num == 1)
    updateDiffCell(row, valCell1.innerText, valCell2.innerText, resetOnly, decimals);
  else
    updateDiffCell(row, valCell2.innerText, valCell1.innerText, resetOnly, decimals);
}

function updateColumns(num)
{
  for(const group of gconstGroups)
  {
    for(const varName of group.variables)
    {
      const gconstRow = gconstTableBody.getElementsByClassName(varName)[0];
      updateRow(num, gconstRow, ruleset[num][varName], rulesetDefault[varName]);
    }

    if(group.hasOwnProperty('damage') && group.hasOwnProperty('reload'))
    {
      const dpsRow = dpsTableBody.getElementsByClassName(group.name)[0];

      const damageRuleset = ruleset[num][group.damage];
      const reloadRuleset = ruleset[num][group.reload];

      const damageDefault = rulesetDefault[group.damage];
      const reloadDefault = rulesetDefault[group.reload];

      const pellets = getPellets(group.name, num);

      let dps = null;
      if(damageRuleset !== undefined && reloadRuleset !== undefined)
        dps = calculateDPS(damageRuleset, reloadRuleset, pellets);
      else if(damageRuleset !== undefined)
        dps = calculateDPS(damageRuleset, reloadDefault, pellets);
      else if(reloadRuleset !== undefined)
        dps = calculateDPS(damageDefault, reloadRuleset, pellets);

      const defaultDPS = dpsRow.getElementsByClassName('val0')[0].innerText;

      const minDecimals = Math.max(
        countDecimals(Number(damageRuleset)),
        countDecimals(Number(reloadRuleset)),
        countDecimals(Number(damageDefault)),
        countDecimals(Number(reloadDefault))
      );

      updateRow(num, dpsRow, dps, defaultDPS, minDecimals);
    }
  }
}

function selectFile(num, fileSelect, saveButton, callback)
{
  if(num != 1 && num != 2)
    return;

  if(!fileSelect)
    return;

  if(!saveButton)
    saveButton = {'disabled': false};
  saveButton.disabled = true;

  if(!callback)
    callback = () => {};

  if(!fileSelect.files[0])
    return;

  const rulesetName = fileSelect.files[0].name.slice(8, -4);
  for(const elem of document.getElementsByClassName(`rulesetName${num}`))
    elem.innerText = rulesetName;

  ruleset[num] = {};

  const fileReader = new FileReader();
  fileReader.onload = (event) =>
  {
    ruleset[num] = parseRuleset(event.target.result);
    updateColumns(num);
    generateChangelog();
    saveButton.disabled = false;
    callback();
  };
  fileReader.readAsText(fileSelect.files[0]);
}

function toggleDefaults()
{
  for(const elem of document.getElementsByClassName('val0'))
    elem.style.display = showDefaults.checked ? 'table-cell' : 'none';
}

function toggleRounding()
{
  if(convertToNumbers.checked)
  {
    roundNumbers.disabled = false;
  }
  else
  {
    roundNumbers.checked = false
    roundNumbers.disabled = true;
  }

  selectFile(1, fileSelect1, saveButton1, () => selectFile(2, fileSelect2, saveButton2));
}

function saveRuleset(num, fileSelect)
{
  if(num != 1 && num != 2)
    return;

  if(!fileSelect.files[0])
    return;

  const rulesetName = fileSelect.files[0].name.slice(8, -4);

  const fileReader = new FileReader();
  fileReader.onload = (event) =>
  {
    let unsetVals = [];
    for(const [groupName, groupDefaults] of Object.entries(ruleset[num].gconstDefs))
      for(const [varName, defaultVal] of Object.entries(groupDefaults))
        unsetVals.push(`${varName} ${defaultVal}`);

    let rulesetFull = event.target.result;
    if(unsetVals.length)
      rulesetFull += `\n\n// default values (Competitive) appended by rulesetdiff\n${unsetVals.join('\n')}`;

    const elem = document.createElement('a');
    elem.style.display = 'none';
    elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(rulesetFull));
    elem.setAttribute('download', `ruleset_${rulesetName}_full.cfg`);

    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  };
  fileReader.readAsText(fileSelect.files[0]);
}

for(const group of gconstGroups)
{
  let varCell = null;
  let valCell0 = null;
  let valCell1 = null;
  let valCell2 = null;
  let diffCell = null;
  for(const varName of group.variables)
  {
    const gconstRow = document.createElement('tr');
    gconstRow.className = varName;

    varCell = document.createElement('td');
    varCell.innerText = varName;
    varCell.className = 'variable';

    valCell0 = document.createElement('td');
    valCell0.innerText = rulesetDefault[varName];
    valCell0.className = 'val0';

    valCell1 = document.createElement('td');
    valCell1.className = 'val1';

    valCell2 = document.createElement('td');
    valCell2.className = 'val2';

    diffCell = document.createElement('td');
    diffCell.className = 'diff';

    gconstRow.appendChild(varCell);
    gconstRow.appendChild(valCell0);
    gconstRow.appendChild(valCell1);
    gconstRow.appendChild(valCell2);
    gconstRow.appendChild(diffCell);

    gconstTableBody.appendChild(gconstRow);
  }
  varCell.classList.add('bottom');
  valCell0.classList.add('bottom');
  valCell1.classList.add('bottom');
  valCell2.classList.add('bottom');
  diffCell.classList.add('bottom');

  if(group.hasOwnProperty('damage') && group.hasOwnProperty('reload'))
  {
    const dpsRow = document.createElement('tr');
    dpsRow.className = group.name;

    varCell = document.createElement('td');
    varCell.innerText = group.name;
    varCell.className = 'variable';

    const damageDefault = rulesetDefault[group.damage];
    const reloadDefault = rulesetDefault[group.reload];
    const dps = calculateDPS(damageDefault, reloadDefault, getPellets(group.name));
    valCell0 = document.createElement('td');
    valCell0.innerText = formatNumber(dps, Math.min(countDecimals(dps), 2));
    valCell0.className = 'val0';

    valCell1 = document.createElement('td');
    valCell1.className = 'val1';

    valCell2 = document.createElement('td');
    valCell2.className = 'val2';

    diffCell = document.createElement('td');
    diffCell.className = 'diff';

    dpsRow.appendChild(varCell);
    dpsRow.appendChild(valCell0);
    dpsRow.appendChild(valCell1);
    dpsRow.appendChild(valCell2);
    dpsRow.appendChild(diffCell);

    dpsTableBody.appendChild(dpsRow);
  }
}
toggleDefaults();
toggleRounding();