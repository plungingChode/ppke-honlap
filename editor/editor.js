let textarea;
let cursor;

function onKeydown(e) {
  if (!textarea) {
    textarea = document.getElementById('textarea');
  }

  const keyCode =  e.which || e.keyCode;

  switch (keyCode) {
    case 8:
      e.preventDefault();
      textarea.innerHTML = 
        textarea.innerHTML.slice(0, -1);
      break;
  
    case 13:
      e.preventDefault();
      textarea.innerHTML += '<br/>';
      break;

    case 9:
      e.preventDefault();
      textarea.innerHTML += '    ';
  
    default:
      break;
  }
}

function onKeypress(e) {
  if (!textarea) {
    textarea = document.getElementById('textarea');
  }

  e.preventDefault();

  let charCode =  e.which || e.keyCode;

  let charTyped = String.fromCharCode(charCode);
    textarea.innerHTML += charTyped;
    
  console.log(charCode + ' ' + String.fromCharCode(charCode));
}

function onMousedown(e) {
  if (!cursor) {
    cursor = document.getElementById('cursor');
  }
  if (!textarea) {
    textarea = document.getElementById('textarea');
  }

  rect = textarea.getBoundingClientRect();

  btn = e.button;
  x = e.clientX;
  y = e.clientY;

  y = Math.round(y / 16) * 16 + rect.top - 16;

  cursor.style.left = x + 'px';
  cursor.style.top =  y + 'px';

  console.log(`button: ${btn}, x=${x}, y=${y}`);
}