var divSquare = '<div id="$coord" onclick="PutStone()" class="block"></div>'
var prev_clicker = '<button id="prev_pos" onclick="ShowPrevPos()">Посмотреть предыдущее состояние</button>'
var next_clicker = '<button id="next_pos" onclick="ShowNextPos()">Посмотреть следующее состояние</button>'
var turn_cnt = 0;
var cur_pos = 0;
var cur_set = new Set();
var player1_set = new Set();
var player2_set = new Set();
var cur_arr = new Array(0);
var player1_arr = new Array(0);
var player2_arr = new Array(0);
var h = 19; <!--параметр высоты-->
var w = 19; <!--параметр ширины-->
var x = 5;
var y = 5;
var human_turn = false;
var comp_turn = 0;
var attack_const = 1;
var defense_const = 1;
var caution_const = 1;
var eps = 1.03;
var first_player_is_human;
var second_player_is_human;

function DrawBoard() {

  $('.header').append(prev_clicker);
  $('.header').append(next_clicker);

  first_player_is_human = confirm("Is first player a human?");
  second_player_is_human = confirm("Is second player a human?");

  x = prompt("print win parameter for first player", 5); // вводим параметр первого игрока
  y = prompt("print win parameter for second player", 5); // вводим параметр второго игрока

  for (let i = 0; i < h; ++i) {
    for (let j = 0; j < w; ++j) {
      $('.main-block').append(divSquare
        .replace('$coord', (w * i + j))); // создаем ячейки с уникальным id
    }
  }

  Game(); // запускаем игру
}

function ResetBoard() { // функция сброса настроек
  for(let index = 0; index < h * w; ++index) {
    let el = document.getElementById(index);
    el.classList.remove("dot1");
    el.classList.remove("dot2");
  }
  turn_cnt = 0;
  cur_pos = 0;
  cur_set = new Set();
  player1_set = new Set();
  player2_set = new Set();
  first_player_is_human = confirm("Is first player a human?");
  second_player_is_human = confirm("Is second player a human?");
  cur_arr = new Array(0);
  player1_arr = new Array(0);
  player2_arr = new Array(0);
  Game();
  // x = prompt("print win parameter for first player", 5);
  // y = prompt("print win parameter for second player", 5);
}

function delay(milliseconds){
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

function CountDiameterValue1(index) { // функция подсчета ценности клетки радиусом для первого игрока
  let value = 0;
  if (cur_set.has(index)) {
    return 0;
  }
  let j = index % w;
  let i = (index - j) / w; // w * i + j

  let radius = 0;
  if (x % 2 === 1) {
    radius = (x - 1) / 2;
  } else {
    radius = (x - 2) / 2;
  }

  let cur_v = 0;
  for (let k = 1; k <= radius; ++k) {
    if (j + k < w && j - k >= 0) {
      let cur_index1 = w * (i) + (j + k);
      let cur_index2 = w * (i) + (j - k);
      if (player1_set.has(cur_index1) && player1_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index1) || player2_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  } // horizontal diameter
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= radius; ++k) {
    if (i + k < h && i - k >= 0) {
      let cur_index1 = w * (i + k) + (j);
      let cur_index2 = w * (i - k) + (j);
      if (player1_set.has(cur_index1) && player1_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index1) || player2_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// vertical diameter
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= radius; ++k) {
    if (i + k < h && i - k >= 0 && j + k < w && j - k >= 0) {
      let cur_index1 = w * (i + k) + (j + k);
      let cur_index2 = w * (i - k) + (j - k);
      if (player1_set.has(cur_index1) && player1_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index1) || player2_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  } // main diag diameter
  value += cur_v;
  cur_v = 0;
  for (let k = 1; k <= radius; ++k) {
    if (i + k < h && i - k >= 0 && j + k < w && j - k >= 0) {
      let cur_index1 = w * (i - k) + (j + k);
      let cur_index2 = w * (i + k) + (j - k);
      if (player1_set.has(cur_index1) && player1_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index1) || player2_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }  // secondary diag diameter
  value += cur_v;


  return value;
}

function CountRayValue1(index) { // функция посчета ценности клетки лучом для первого игрока
  let value = 0;
  if (cur_set.has(index)) {
    return 0;
  }
  let j = index % w;
  let i = (index - j) / w; // w * i + j

  let cur_v = 0;
  for (let k = 1; k <= x - 1; ++k) {
    if (j + k < w) {
      let cur_index = w * (i) + (j + k);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  } // count R row

  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j - k >= 0) {
      let cur_index = w * (i) + (j - k);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count L row
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (i - k >= 0) {
      let cur_index = w * (i - k) + (j);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count U column
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (i + k < h) {
      let cur_index = w * (i + k) + (j);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count D column

  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j + k < w && i - k >= 0) {
      let cur_index = w * (i - k) + (j + k);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count RU diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j + k < w && i + k < h) {
      let cur_index = w * (i + k) + (j + k);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count RD diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j - k >= 0 && i - k >= 0) {
      let cur_index = w * (i - k) + (j - k);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count LU diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j - k >= 0 && i + k < h) {
      let cur_index = w * (i + k) + (j - k);
      if (player1_set.has(cur_index)) {
        cur_v += 1;
      } else if (player2_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count LD diag
  value += cur_v;
  cur_v = 0;

  return value;
}

function CountDiameterValue2(index) { // функция подсчета ценности клетки радиусом для второго игрока
  let value = 0;
  if (cur_set.has(index)) {
    return 0;
  }
  let j = index % w;
  let i = (index - j) / w; // w * i + j

  let radius = 0;
  if (x % 2 === 1) {
    radius = (x - 1) / 2;
  } else {
    radius = (x - 2) / 2;
  }

  let cur_v = 0;
  for (let k = 1; k <= radius; ++k) {
    if (j + k < w && j - k >= 0) {
      let cur_index1 = w * (i) + (j + k);
      let cur_index2 = w * (i) + (j - k);
      if (player2_set.has(cur_index1) && player2_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index1) || player1_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  } // horizontal diameter
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= radius; ++k) {
    if (i + k < h && i - k >= 0) {
      let cur_index1 = w * (i + k) + (j);
      let cur_index2 = w * (i - k) + (j);
      if (player2_set.has(cur_index1) && player2_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index1) || player1_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// vertical diameter
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= radius; ++k) {
    if (i + k < h && i - k >= 0 && j + k < w && j - k >= 0) {
      let cur_index1 = w * (i + k) + (j + k);
      let cur_index2 = w * (i - k) + (j - k);
      if (player2_set.has(cur_index1) && player2_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index1) || player1_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  } // main diag diameter
  value += cur_v;
  cur_v = 0;
  for (let k = 1; k <= radius; ++k) {
    if (i + k < h && i - k >= 0 && j + k < w && j - k >= 0) {
      let cur_index1 = w * (i - k) + (j + k);
      let cur_index2 = w * (i + k) + (j - k);
      if (player2_set.has(cur_index1) && player2_set.has(cur_index2)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index1) || player1_set.has(cur_index2)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }  // secondary diag diameter
  value += cur_v;


  return value;
}

function CountRayValue2(index) { // функция подсчета ценности клетки лучом для второго игрока
  let value = 0;
  if (cur_set.has(index)) {
    return 0;
  }
  let j = index % w;
  let i = (index - j) / w; // w * i + j

  let cur_v = 0;
  for (let k = 1; k <= x - 1; ++k) {
    if (j + k < w) {
      let cur_index = w * (i) + (j + k);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  } // count R row

  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j - k >= 0) {
      let cur_index = w * (i) + (j - k);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count L row
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (i - k >= 0) {
      let cur_index = w * (i - k) + (j);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count U column
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (i + k < h) {
      let cur_index = w * (i + k) + (j);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count D column

  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j + k < w && i - k >= 0) {
      let cur_index = w * (i - k) + (j + k);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count RU diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j + k < w && i + k < h) {
      let cur_index = w * (i + k) + (j + k);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count RD diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j - k >= 0 && i - k >= 0) {
      let cur_index = w * (i - k) + (j - k);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count LU diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= x - 1; ++k) {
    if (j - k >= 0 && i + k < h) {
      let cur_index = w * (i + k) + (j - k);
      if (player2_set.has(cur_index)) {
        cur_v += 1;
      } else if (player1_set.has(cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count LD diag
  value += cur_v;

  return value;
}

function FourLinesCheker(player, index, flag) { // для подсчета выигрыша
  let counter = 1;
  alert(x);
  alert(y);
  let param = x;
  if (flag === 2) {
    param = y;
  }

  let j = index % w;
  let i = (index - j) / w; // w * i + j

  for (let k = 1; k < param; ++k) { // or - 1
    if (j + k >= w) {
      break;
    }
    let cur_index = w * i + (j + k);
    if (player.has(cur_index)) {
      counter += 1;
    } else {
      break;
    }
  }
  if (param === counter) {
    return true;
  }
  counter = 1;

  for (let k = 1; k < param; ++k) { // or - 1
    if (i + k >= h) {
      break;
    }
    let cur_index = w * (i + k) + j;
    if (player.has(cur_index)) {
      counter += 1;
    } else {
      break;
    }
  }
  if (param === counter) {
    return true;
  }
  counter = 1;

  for (let k = 1; k < param; ++k) { // or - 1
    if (j + k >= w || i + k >= h) {
      break;
    }
    let cur_index = w * (i + k) + (j + k);
    if (player.has(cur_index)) {
      counter += 1;
    } else {
      break;
    }
  }

  if (param === counter) {
    return true;
  }
  counter = 1;

  for (let k = 1; k < param; ++k) { // or - 1
    if (j - k < 0 || i + k >= h) {
      break;
    }
    let cur_index = w * (i + k) + (j - k);
    if (player.has(cur_index)) {
      counter += 1;
    } else {
      break;
    }
  }

  return (param === counter);
}

function WinCheker() { // функция, смотрящая есть ли победитель (не работает)
  for (let index = 0; index < h * w; ++index) {
    if (player1_set.has(index)) {
      if (FourLinesCheker(player1_arr, index, 1)) {
        alert("First player is a winner!");
        return true;
      }
    } else if (player2_set.has(index)) {
      if (FourLinesCheker(player2_arr, index, 2)) {
        alert("Second player is a winner!");
        return true;
      }
    }
  }
  return false;
}

function ReconstructBoardValues() { // Пересчитываем значение каждой клетки
  let value = 0;
  let v_max = 0;
  // let arr_of_top_blocks = new Array(0);
  for (let index = 0; index < h * w; ++index) {
    if (!cur_set.has(index)) {
      let attack = attack_const * CountDiameterValue1(index) + attack_const * attack_const * CountRayValue1(index); // A
      let defense = defense_const * CountDiameterValue2(index) + defense_const * defense_const * CountRayValue2(index); // D
      value = attack - caution_const * defense;
      if (value >= v_max) {
        v_max = value;
        comp_turn = index;
      }
    }

    // arr_of_top_blocks.push({value, index});
  }
  // arr_of_top_blocks.sort();
  // comp_turn = arr_of_top_blocks.pop()[1];
  // alert(comp_turn);
  // alert(comp_turn);
}

function ShowPrevPos() { // Функция показа предыдущей позиции в журнале
  if (cur_pos === 0) {
    alert('incorrect command');
  } else {
    --cur_pos;
    alert('prev turn = ' + cur_pos);
    let id = cur_arr[cur_pos];
    let el = document.getElementById(id);
    if (cur_pos % 2 === 0) {
      el.classList.remove("dot1");
    } else {
      el.classList.remove("dot2");
    }
  }
}

function ShowNextPos() { // функция, показывающая следующую позицию в журнале
  if (cur_pos === turn_cnt) {
    alert('incorrect command');
  } else {
    alert('next turn = ' + (cur_pos + 1));
    let id = cur_arr[cur_pos];
    let el = document.getElementById(id);
    // el.classList.add("dot");
    if (cur_pos % 2 === 0) {
      el.classList.add("dot1");
    } else {
      el.classList.add("dot2");
    }
    ++cur_pos;
  }
}

async function AIturn() { // Ход компьютера
  let id = comp_turn;
  let el = document.getElementById(id);
  if (turn_cnt % 2 === 0) {
    el.classList.add("dot1");
    player1_arr.push(id);
    player1_set.add(id);
  } else {
    el.classList.add("dot2");
    player2_arr.push(id);
    player2_set.add(id);
  }

  cur_arr.push(id);
  cur_set.add(id);
  ++turn_cnt;
  // alert('current turn = ' + turn_cnt);
  cur_pos = turn_cnt;

  if (WinCheker()) {
    alert("reset");
    ResetBoard();
  }
  if (turn_cnt % 2 === 0) {
    if (!first_player_is_human) {
      ReconstructBoardValues();
      await delay(1500);
      AIturn();
    } else {
      human_turn = true;
    }
  } else {
    if (!second_player_is_human) {
      ReconstructBoardValues();
      await delay(1500);
      AIturn();
    } else {
      human_turn = true;
    }
  }
}

async function PutStone() { // Функция хода человека
  if (!human_turn) {
    return;
  }
  let id = event.srcElement.id;
  let el = document.getElementById(id);
  // el.classList.add("dot");

  if (cur_set.has(id)) {
    alert('incorrect pos');
    return;
  } else {
    if (cur_pos === turn_cnt) {
      if (turn_cnt % 2 === 0) {
        el.classList.add("dot1");
        player1_arr.push(id);
        player1_set.add(id);
      } else {
        el.classList.add("dot2");
        player2_arr.push(id);
        player2_set.add(id);
      }
      human_turn = false;

      cur_arr.push(id);
      cur_set.add(id);
      ++turn_cnt;
      // alert('current turn = ' + turn_cnt);
      cur_pos = turn_cnt;
    } else {
      alert('incorrect pos');
    }
  }
  if (WinCheker()) {
    alert("reset");
    ResetBoard();
  }
  if (turn_cnt % 2 === 0) {
    if (!first_player_is_human) {
      ReconstructBoardValues();
      await delay(1500);
      AIturn();
    } else {
      human_turn = true;
    }
  } else {
    if (!second_player_is_human) {
      ReconstructBoardValues();
      await delay(1500);
      AIturn();
    } else {
      human_turn = true;
    }
  }
}

async function Game() { // Начадло игры
  // TODO: time controller
  if (!first_player_is_human) {
    ReconstructBoardValues();
    await delay(1500);
    AIturn();
  } else {
    human_turn = true;
  }
}

DrawBoard(); // Отрисовываем доску
