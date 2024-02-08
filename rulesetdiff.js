const sign = [
  {'symbol': '-', 'literal': 'negative', 'change': 'decreased', 'absolute': 'disabled'},
  {'symbol': '+', 'literal': 'positive', 'change': 'increased', 'absolute': 'enabled'}
];
const shape = ['pill', 'bullet'];

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

function calculateDPS(damage, reload)
{
  return (Number(damage) * 1000 / Number(reload)).toString();
}

function parseRuleset(rulesetVars, rulesetStr)
{
  for(let line of rulesetStr.split('\n'))
  {
    line = line.trim();
    if(line.length > 0 && line.substring(0, 7) == 'gconst_')
    {
      line = line.split(' ');
      rulesetVars[line[0]] = line[1];
    }
  }
}

function updateDiffCell(row, varName, gconstVal1, gconstVal2, resetOnly, decimals)
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

  switch(varName)
  {
    case 'gconst_player_isbullet':
      changelog.textContent += `Player hitbox changed from ${shape[gconstNum1]} to ${shape[gconstNum2]}`;
      break;
    case 'gconst_expose_timers_to_lua':
    case 'gconst_powerups_drop':
    case 'gconst_wallclipping':
      changelog.textContent += `${varName} ${sign[diffSign].absolute}`;
      break;
    default:
      if(varName in dpsVars)
        varName = `${varName} DPS`;

      const diffRelative = Number(gconstDiff / gconstNum1 * 100);
      const decimalsRelative = Math.min(countDecimals(diffRelative), 2);
      changelog.textContent += `${varName} ${sign[diffSign].change} from ${gconstVal1} to ${gconstVal2}`
      changelog.textContent += ` (${sign[diffSign].symbol}${Math.abs(diffRelative.toFixed(decimalsRelative))}%)`;
  }
  changelog.textContent += '\n';
}

function updateRow(row, num, varName, newVal, defaultVal, minDecimals = 0)
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
  if(varName in dpsVars)
    decimals = Math.min(decimals, 2);
  decimals = Math.max(decimals, minDecimals);

  gconstCell1.innerText = formatNumber(newValNum, decimals);

  const resetOnly = gconstCell2.innerText == '';
  if(!resetOnly)
    gconstCell2.innerText = formatNumber(gconstCell2.innerText, decimals);

  if(num == 1)
    updateDiffCell(row, varName, gconstCell1.innerText, gconstCell2.innerText, resetOnly, decimals);
  else
    updateDiffCell(row, varName, gconstCell2.innerText, gconstCell1.innerText, resetOnly, decimals);

  return newValNum;
}

function updateColumns(num)
{
  for(const [groupName, varGroup] of Object.entries(gconstVars))
  {
    let groupDefaults = {};
    let weapon = {};
    for(const [varName, defaultVal] of Object.entries(varGroup))
    {
      const gconstRow = gconstTableBody.getElementsByClassName(varName)[0];
      const gconstVal = updateRow(gconstRow, num, varName, ruleset[num].gconstVals[varName], defaultVal);
      groupDefaults[varName] = gconstVal;
      const varNameEnd = varName.split('_').slice(-1)[0];
      if(groupName in dpsVars && varNameEnd in dpsVars[groupName])
        weapon[varNameEnd] = ruleset[num].gconstVals[varName];
    }
    ruleset[num].gconstDefs.push(groupDefaults);

    if(groupName in dpsVars)
    {
      const dpsRow = dpsTableBody.getElementsByClassName(groupName)[0];
      const defaultWeapon = {'damage': dpsVars[groupName].damage, 'reload': dpsVars[groupName].reload};
      let pellets = Number(dpsVars[groupName].pellets);
      if(!pellets)
        pellets = 1;

      let weaponDPS = null;
      if(weapon.damage !== undefined && weapon.reload !== undefined)
        weaponDPS = calculateDPS(pellets * weapon.damage, weapon.reload, dpsVars[groupName].pellets);
      else if(weapon.damage !== undefined)
        weaponDPS = calculateDPS(pellets * weapon.damage, defaultWeapon.reload, dpsVars[groupName].pellets);
      else if(weapon.reload !== undefined)
        weaponDPS = calculateDPS(pellets * defaultWeapon.damage, weapon.reload, dpsVars[groupName].pellets);

      const defaultDPS = calculateDPS(pellets * defaultWeapon.damage, defaultWeapon.reload);

      let decimals = [weapon.damage, weapon.reload, defaultWeapon.damage, defaultWeapon.reload];
      decimals = decimals.map((val) => countDecimals(Number(val)));
      decimals = Math.max(decimals[0], decimals[1], decimals[2], decimals[3]);

      updateRow(dpsRow, num, groupName, weaponDPS, defaultDPS, decimals);
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
  ruleset[num].gconstDefs = [];

  const fileReader = new FileReader();
  fileReader.onload = function(event)
  {
    ruleset[num].str = event.target.result;
    parseRuleset(ruleset[num].gconstVals, ruleset[num].str);
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

  let rulesetFullStr = ruleset[num].str;
  if(ruleset[num].gconstDefs.length)
  {
    rulesetFullStr += '\n\n// default values (Competitive) appended by rulesetdiff';
    for(const varGroup of ruleset[num].gconstDefs)
    {
      rulesetFullStr += '\n';
      for(const [varName, defaultVal] of Object.entries(varGroup))
        rulesetFullStr += `${varName} ${defaultVal}\n`;
    }

    if(rulesetFullStr.slice(-1)[0] == '\n')
      rulesetFullStr = rulesetFullStr.slice(0, -1);
  }

  const elem = document.createElement('a');
  elem.style.display = 'none';
  elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(rulesetFullStr));
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

for(const [groupName, varGroup] of Object.entries(gconstVars))
{
  let varCell = null;
  let valCell0 = null;
  let valCell1 = null;
  let valCell2 = null;
  let diffCell = null;
  for(const [varName, defaultVal] of Object.entries(varGroup))
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

  if(groupName in dpsVars)
  {
    const dpsRow = document.createElement('tr');
    dpsRow.className = groupName;

    varCell = document.createElement('td');
    varCell.innerText = groupName;
    varCell.className = 'variable';

    valCell0 = document.createElement('td');

    valCell0.innerText = Number(dpsVars[groupName].damage) * 1000 / Number(dpsVars[groupName].reload);
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