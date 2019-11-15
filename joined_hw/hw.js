const resultsUrl = 'http://users.itk.ppke.hu/~flugi/files/resc.html';
const feladatUrl = 'https://docs.google.com/document/d/e/2PACX-1vTZc-GUE4YHugQOoZGotOqkqdouETldaMW9D897PiOE2ID0kQnyN1ZrT7n4K1rRUwFYLoCvjz8vYB9w/pub';
const resultsUrlTemp = 'http://127.0.0.1:5500/joined_hw/example-checked.html';

const UNSET_HW = /^nincs*/i;
const DIGITS = /[0-9]+/g;

function getUrl(url, callback) {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      callback(req.responseText);
    }
  }
  req.open('GET', url, true);
  req.send();
  return req.onreadystatechange;
}

$(document).ready(function() {
  getUrl(resultsUrlTemp, res => {
    resultsToArray(res, true);
  });
});

class User {
  constructor(name, weekData) {
    this.name = name;
    this.weekData = weekData;
  }
}

class Week {
  constructor(weekNum, homework) {
    this.weekNum = weekNum;
    this.homework = homework;
  }
}

class Homework {
  constructor(section, task, type, status, errorContent = null) {
    this.section = parseInt(section);
    this.type = type;
    this.splitTask(task);
    this.errorContent = errorContent;
    this.status = status;
  }

  splitTask(taskStr) {
    const digits = DIGITS.exec(taskStr);

    // what the fuck is this????
    if (digits) {
      const digitsStr = digits.join();
      this.task = parseInt(digitsStr);
      this.subtask = taskStr.slice(digitsStr.length);

      if (this.subtask.length === 0) {
        this.subtask = null;
      }
    } else {
      console.log(taskStr);
      this.task = taskStr;
      this.subtask = null;
    }
  }
}

function parseHomework(td, isCpp = false) {
  let rawStr = $(td).text().trim();
  const bg = $(td).attr('bgcolor');

  let homework = new Homework('1', '1', '1', '1');
  let errorContent = null;
  let status = 'none';
  const type = isCpp ? 'cpp' : 'plang';

  if (bg === 'red') {
    // not uploaded
    rawStr = rawStr.slice(3, -16);
    status = 'not-uploaded';
  }
  else if (bg === 'orange' || bg === 'tomato') {
    // runtime or compile error
    if (bg === 'orange') {
      status = 'runtime-error';
    } else {
      status = 'compile-error';
    }
    const errorSpan = $(td).children('span')[0];
    errorContent = $(errorSpan).attr('title');
    
    rawStr = rawStr.slice(0, -5);
  }
  else if (bg === 'lightgreen') {
    // OK
    rawStr = rawStr.slice(0, -3);
    status = 'ok';
  }
  else if (bg === undefined) {
    // uploaded, can't check
    rawStr = rawStr.slice(0, -10);
    status = 'uploaded-unchecked';
  }

  if (rawStr.indexOf('.') != -1) {
    const parts = rawStr.split('.');
    if (parts.length === 2) {
      homework = new Homework(parts[0], parts[1], type, status);
    }
    else if (parts.length === 3) {
      if (parts[2].length >= 3) {
        homework = new Homework(parts[0], parts[1], type, status);
      }
      else {
        homework = new Homework(parts[0], parts[1] + parts[2], type, status);
      }
    }
    else if (parts.length > 3) {
      // TODO
    }
  } else {
    homework = new Homework(null, rawStr, type, status);
  }

  homework.errorContent = errorContent;
  return homework;
}

function parseUser(userRow, isCpp) {
  const userCells = $(userRow).children('td');
  const userName = userCells[0].innerHTML.trim();
  
  let weeks = [];
  for (let i = 1; i < userCells.length; i++) {
    // filter homework data, remove unset entries
    const homework = $(userCells[i])
      .find('td')
      .toArray()
      .filter(d => !UNSET_HW.test(d.innerHTML))
      .map(d => parseHomework(d, isCpp));

    if (homework.length > 0) {
      let weekNum = i;
      if (isCpp) {
        weekNum += 5;
      }
      weeks.push(new Week(weekNum, homework))
    }
  }

  return new User(userName, weeks);
}

function resultsToArray(results) {
  const tableRoot = $(results)[12];
  const userRows = $(tableRoot)
      .children()
      .children()
      .toArray();

  let userData = [];
  userRows.forEach(row => userData.push(parseUser(row, true)));

  console.log(userData);

  return userData;
}