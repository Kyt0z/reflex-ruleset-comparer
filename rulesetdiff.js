let ruleset = {
  '1': {'name': 'Ruleset 1', 'file': null, 'str': null, 'gconstVals': null, 'gconstDefs': null},
  '2': {'name': 'Ruleset 2', 'file': null, 'str': null, 'gconstVals': null, 'gconstDefs': null}
};

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
    if(num !== undefined && ruleset[num].gconstVals.hasOwnProperty('gconst_burstgun_burstsegments'))
      return Number(ruleset[num].gconstVals['gconst_burstgun_burstsegments']) + 1;
    else
      return Number(gconstDefaults['burstgun']['gconst_burstgun_burstsegments']) + 1;
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

function updateDiffCell(row, varOrGroupName, gconstVal1, gconstVal2, resetOnly, decimals)
{
  const diffCell = row.getElementsByClassName('diff')[0];
  diffCell.classList.remove('negative', 'positive');
  diffCell.innerText = '';

  if(resetOnly)
    return;

  const gconstNum1 = Number(gconstVal1);
  const gconstNum2 = Number(gconstVal2);

  const gconstDiff = gconstNum2 - gconstNum1;
  if(gconstDiff == 0)
    return;

  const diffSign = +(gconstDiff > 0);

  diffCell.classList.add(sign[diffSign].literal);
  diffCell.innerText = `${sign[diffSign].symbol}${formatNumber(Math.abs(gconstDiff), decimals)}`;

  let clearName = varOrGroupName.split('_');
  clearName = [clearName.slice(0, 2).join('_'), clearName.slice(2).join('_')]
  if(clearNames.hasOwnProperty(varOrGroupName))
    clearName = clearNames[varOrGroupName];
  else if(clearNames.hasOwnProperty(clearName[0]) && clearNames.hasOwnProperty(clearName[1]))
    clearName = `${clearNames[clearName[0]]} ${clearNames[clearName[1]]}`;
  else
    clearName = varOrGroupName;

  switch(varOrGroupName)
  {
    case 'gconst_player_isbullet':
      changelog.textContent += `${clearName} changed from ${shape[gconstNum1]} to ${shape[gconstNum2]}`;
      break;
    case 'gconst_expose_timers_to_lua':
    case 'gconst_powerups_drop':
    case 'gconst_wallclipping':
    case 'gconst_stakelauncher_enabled':
      changelog.textContent += `${clearName} ${sign[diffSign].absolute}`;
      break;
    default:
      if(dpsVars.hasOwnProperty(varOrGroupName))
        clearName = `${clearName} DPS`;

      const diffRelative = Number(gconstDiff / gconstNum1 * 100);
      const decimalsRelative = Math.min(countDecimals(diffRelative), 2);
      changelog.textContent += `${clearName} ${sign[diffSign].change} from ${gconstVal1} to ${gconstVal2}`
      changelog.textContent += ` (${sign[diffSign].symbol}${Math.abs(diffRelative.toFixed(decimalsRelative))}%)`;
  }
  changelog.textContent += '\n';
}

function updateRow(num, row, varOrGroupName, newVal, defaultVal, minDecimals = 0)
{
  const gconstCell0 = row.getElementsByClassName('val0')[0];
  const gconstCell1 = row.getElementsByClassName(`val${num}`)[0];
  const gconstCell2 = row.getElementsByClassName(`val${num % 2 + 1}`)[0];

  let newValNum = null;
  if(newVal !== undefined && newVal !== null)
  {
    newValNum = formatNumber(newVal);
    gconstCell1.classList.remove('unset');
  }
  else
  {
    newValNum = formatNumber(defaultVal);
    gconstCell1.classList.add('unset');
  }

  if(gconstCell1.classList.contains('unset') || gconstCell2.classList.contains('unset'))
    gconstCell0.classList.remove('unset');
  else
    gconstCell0.classList.add('unset');

  let decimals = Math.max(countDecimals(newValNum), countDecimals(gconstCell2.innerText));
  if(dpsVars.hasOwnProperty(varOrGroupName))
    decimals = Math.min(decimals, 2);
  decimals = Math.max(decimals, minDecimals);

  gconstCell1.innerText = formatNumber(newValNum, decimals);

  const resetOnly = gconstCell2.innerText == '';
  if(!resetOnly)
    gconstCell2.innerText = formatNumber(gconstCell2.innerText, decimals);

  if(num == 1)
    updateDiffCell(row, varOrGroupName, gconstCell1.innerText, gconstCell2.innerText, resetOnly, decimals);
  else
    updateDiffCell(row, varOrGroupName, gconstCell2.innerText, gconstCell1.innerText, resetOnly, decimals);
}

function updateColumns(num)
{
  for(const [groupName, groupDefaults] of Object.entries(gconstDefaults))
  {
    ruleset[num].gconstDefs[groupName] = {};
    for(const [varName, defaultVal] of Object.entries(groupDefaults))
    {
      const gconstRow = gconstTableBody.getElementsByClassName(varName)[0];
      updateRow(num, gconstRow, varName, ruleset[num].gconstVals[varName], defaultVal);
      if(ruleset[num].gconstVals[varName] === undefined)
        ruleset[num].gconstDefs[groupName][varName] = defaultVal;
    }

    if(dpsVars.hasOwnProperty(groupName))
    {
      const dpsRow = dpsTableBody.getElementsByClassName(groupName)[0];

      const damageVar = dpsVars[groupName].damage;
      const reloadVar = dpsVars[groupName].reload;

      const damageRuleset = ruleset[num].gconstVals[damageVar];
      const reloadRuleset = ruleset[num].gconstVals[reloadVar];

      const damageDefault = groupDefaults[damageVar];
      const reloadDefault = groupDefaults[reloadVar];

      const pellets = getPellets(groupName, num);

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

      updateRow(num, dpsRow, groupName, dps, defaultDPS, minDecimals);
    }

    if(changelog.textContent.slice(-2) != '\n\n')
      changelog.textContent += '\n';
  }
}

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
    callback = function() {};

  ruleset[num].file = fileSelect.files[0];
  if(!ruleset[num].file)
    return;

  ruleset[num].name = ruleset[num].file.name.slice(8, -4);
  for(const elem of document.getElementsByClassName(`rulesetName${num}`))
    elem.innerText = ruleset[num].name;

  changelog.textContent = `Changes from ${ruleset[1].name} to ${ruleset[2].name}:\n\n`;
  ruleset[num].gconstVals = {};
  ruleset[num].gconstDefs = {};

  const fileReader = new FileReader();
  fileReader.onload = function(event)
  {
    ruleset[num].str = event.target.result;
    ruleset[num].gconstVals = parseRuleset(ruleset[num].str);
    updateColumns(num);
    saveButton.disabled = false;
    callback();
  };
  fileReader.readAsText(ruleset[num].file);
}

function toggleDefaults(showDefaults)
{
  for(const elem of document.getElementsByClassName('val0'))
    elem.style.display = showDefaults.checked ? 'table-cell' : 'none';
}

function toggleRounding(convertToNumbers, roundNumbers, fileSelect1, fileSelect2, saveButton1, saveButton2)
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

function saveRuleset(num)
{
  if(num != 1 && num != 2)
    return;

  if(!ruleset[num].file)
    return;

  let unsetVals = [];
  for(const [groupName, groupDefaults] of Object.entries(ruleset[num].gconstDefs))
    for(const [varName, defaultVal] of Object.entries(groupDefaults))
      unsetVals.push(`${varName} ${defaultVal}`);

  let rulesetFull = ruleset[num].str;
  if(unsetVals.length)
    rulesetFull += `\n\n// default values (Competitive) appended by rulesetdiff\n${unsetVals.join('\n')}`;

  const elem = document.createElement('a');
  elem.style.display = 'none';
  elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(rulesetFull));
  elem.setAttribute('download', `ruleset_${ruleset[num].name}_full.cfg`);

  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}

fileSelect1.addEventListener('change', (event) => selectFile(1, event.currentTarget, saveButton1));
fileSelect2.addEventListener('change', (event) => selectFile(2, event.currentTarget, saveButton2));
showDefaults.addEventListener('change', (event) => toggleDefaults(event.currentTarget));
convertToNumbers.addEventListener('change', (event) => toggleRounding(event.currentTarget, roundNumbers, fileSelect1, fileSelect2, saveButton1, saveButton2));
roundNumbers.addEventListener('change', (event) => toggleRounding(convertToNumbers, event.currentTarget, fileSelect1, fileSelect2, saveButton1, saveButton2));
saveButton1.addEventListener('click', () => saveRuleset(1));
saveButton2.addEventListener('click', () => saveRuleset(2));

for(const [groupName, groupDefaults] of Object.entries(gconstDefaults))
{
  let varCell = null;
  let valCell0 = null;
  let valCell1 = null;
  let valCell2 = null;
  let diffCell = null;
  for(const [varName, defaultVal] of Object.entries(groupDefaults))
  {
    const gconstRow = document.createElement('tr');
    gconstRow.className = varName;

    varCell = document.createElement('td');
    varCell.innerText = varName;
    varCell.className = 'variable';

    valCell0 = document.createElement('td');
    valCell0.innerText = defaultVal;
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

  if(dpsVars.hasOwnProperty(groupName))
  {
    const dpsRow = document.createElement('tr');
    dpsRow.className = groupName;

    varCell = document.createElement('td');
    varCell.innerText = groupName;
    varCell.className = 'variable';

    const damageVar = dpsVars[groupName].damage;
    const reloadVar = dpsVars[groupName].reload;
    const damageDefault = groupDefaults[damageVar];
    const reloadDefault = groupDefaults[reloadVar];
    const dps = calculateDPS(damageDefault, reloadDefault, getPellets(groupName));
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
toggleDefaults(showDefaults);
toggleRounding(convertToNumbers, roundNumbers, fileSelect1, fileSelect2, saveButton1, saveButton2);