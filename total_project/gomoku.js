var divSquare = '<div id="$coord" onclick="HumanTurn()" class="block"></div>'
var prev_clicker = '<button id="prev_pos" onclick="ShowPrevPos()">Посмотреть предыдущее состояние</button>'
var next_clicker = '<button id="next_pos" onclick="ShowNextPos()">Посмотреть следующее состояние</button>'
var turn_cnt = 0; <!--параметр, подсчитывающий количество сделанных ходов-->
var cur_pos = 0; <!--параметр текущей позиции-->
var h = 19; <!--параметр высоты-->
var w = 19; <!--параметр ширины-->
var x = 5; <!--параметр победы одного игрока-->
var y = 5; <!--параметр победы второго игрока-->
var human_turn = false; <!--параметр, позволяющий позволять человеку ходить-->
var comp_turn = 0; <!--параметр, отвечающий за индекс, куда компьютер будет ходить-->
var attack_const = 1.; <!--параметр атаки-->
var defense_const = 1.; <!--параметр защиты-->
var caution_const = 1.; <!--параметр сдержанности-->
var empty_value = 0.005; <!--параметр ценности пусток клетки-->
var eps = 0.001; <!--параметр отклонения-->
var first_player_is_human; <!--булевый параметр-->
var second_player_is_human; <!--булевый параметр-->
var cur_set = new Set(); <!--Сет, поддерживающий все проставленные камни-->
var player1_set = new Set(); <!--Сет, поддерживающий все проставленные камни первым игроком-->
var player2_set = new Set(); <!--Сет, поддерживающий все проставленные камни вторым игроком-->
var cur_arr = new Array(0); <!--аналогичен cur_set, от одного из них в будущем избавимся-->

<!--Блок, вспомогательных функций-->
function HasEl(obj, el) { // функция, определяющая есть ли в объекте данный элемент (встроенные работают плохо)
  for (const i of obj) {
    if (i.toString() === el.toString()) {
      return true;
    }
  }
  return false;
}

function comparePairs(a, b) { // компаратор для массива пар, сортирующий по ценности клетки в порядке убывания
  return b.val - a.val;
}

function arrayRandElement(arr) { // функция, возвращающая рандомный элемент массива
  let rand = Math.floor(Math.random() * arr.length);
  return arr[rand];
}

function delay(milliseconds){ // функция остановки функционала на milliseconds
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

<!--Блок, игровых функций-->
// TODO: time controller
function DrawBoard() { // функция отрисовки доски
  $('.header').append(prev_clicker); // добавляем в header кнопку отката назад
  $('.header').append(next_clicker); // добавляем в header кнопку отката вперед

  first_player_is_human = confirm("Is first player a human?"); // назначаем первого игрока
  second_player_is_human = confirm("Is second player a human?"); // назначаем второго игрока

  // x = prompt("print win parameter for first player", 5); // вводим параметр первого игрока
  // y = prompt("print win parameter for second player", 5); // вводим параметр второго игрока

  for (let i = 0; i < h; ++i) {
    for (let j = 0; j < w; ++j) {
      $('.main-block').append(divSquare
        .replace('$coord', (w * i + j))); // создаем ячейки с уникальным id
    }
  }

  Game(); // запускаем игру
}

function ResetBoard() { // функция сброса настроек
  for (let index = 0; index < h * w; ++index) { // стираем нарисованные камни
    let el = document.getElementById(index);
    el.classList.remove("dot1");
    el.classList.remove("dot2");
  }
  turn_cnt = 0; // обновляем все параметры до начальных
  cur_pos = 0;
  cur_set.clear();
  player1_set.clear();
  player2_set.clear();
  human_turn = false;
  first_player_is_human = confirm("Is first player a human?");
  second_player_is_human = confirm("Is second player a human?");
  // x = prompt("print win parameter for first player", 5);
  // y = prompt("print win parameter for second player", 5);
  cur_arr = new Array(0);
  Game(); // запускаем игру заново
}

async function Game() { // Начало игры, а точнее первый ход
  if (!first_player_is_human) {
    ReconstructBoardValues();
    await delay(1500);
    AIturn();
  } else {
    human_turn = true;
  }
}
<!--Блок, математических функций для подсчета или проверки ценности клетки-->
function ReconstructBoardValues() { // Пересчитываем значение каждой клетки
  let value = 0;
  let new_arr = new Array(0);
  for (let index = 0; index < h * w; ++index) {
    if (!HasEl(cur_set, index)) { // Если есть элемент, то нет смысла подсчитывать ценность
      let attack = attack_const * CountDiameterValue(index, player1_set, player2_set, 1) + (attack_const ** 2) * CountRayValue(index, player1_set, player2_set, 1); // A power
      let defense = defense_const * CountDiameterValue(index, player2_set, player1_set, 2) + (defense_const ** 2) * CountRayValue(index, player2_set, player1_set, 2); // D power
      value = attack - caution_const * defense + CountEmptyValue(index); // ценность клетки (может меняться)
      // value = Math.abs(value);
      new_arr.push({val: value, ind: index}); // добавляем пару: ценность, индекс
      value = 0;
    }
  }
  new_arr.sort(comparePairs); // Сортируем по убыванию ценности клетки
  let total_arr = new Array(0);
  let max_index = 0;
  let max_value = new_arr[0].val;
  for (let i = 0; i < new_arr.length; ++i) {
    if (eps > max_value - new_arr[i].val) { // выбираем max_index элементов, отличающихся максимум на eps
      ++max_index;
    } else {
      break;
    }
  }
  for (let i = 0; i < max_index; ++i) {
    total_arr.push(new_arr[i].ind);
  }
  comp_turn = arrayRandElement(total_arr); // выбираем случайный элемент в итоговом массиве
  // comp_turn = new_arr[0].ind;
  // alert(comp_turn);
  // alert(comp_turn);
}

function CountDiameterValue(index, cur_player_set, rival_set, flag) { // функция подсчета ценности клетки радиусом
  let value = 0;
  let j = index % w;
  let i = (index - j) / w; // w * i + j
  let param = x;
  if (flag === 2) {
    param = y;
  }

  let radius = 0;
  if (param % 2 === 1) {
    radius = (param - 1) / 2;
  } else {
    radius = (param - 2) / 2;
  }

  let cur_v = 0;
  for (let k = 1; k <= radius; ++k) {
    if (j + k < w && j - k >= 0) {
      let cur_index1 = w * (i) + (j + k);
      let cur_index2 = w * (i) + (j - k);
      if (HasEl(cur_player_set, cur_index1) && HasEl(cur_player_set, cur_index2)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index1) || HasEl(rival_set, cur_index2)) {
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
      if (HasEl(cur_player_set, cur_index1) && HasEl(cur_player_set, cur_index2)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index1) || HasEl(rival_set, cur_index2)) {
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
      if (HasEl(cur_player_set, cur_index1) && HasEl(cur_player_set, cur_index2)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index1) || HasEl(rival_set, cur_index2)) {
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
      if (HasEl(cur_player_set, cur_index1) && HasEl(cur_player_set, cur_index2)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index1) || HasEl(rival_set, cur_index2)) {
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

function CountRayValue(index, cur_player_set, rival_set, flag) { // функция посчета ценности клетки лучом
  let value = 0;
  let j = index % w;
  let i = (index - j) / w; // w * i + j
  let param = x;
  if (flag === 2) {
    param = y;
  }

  let cur_v = 0;
  for (let k = 1; k <= param - 1; ++k) {
    if (j + k < w) {
      let cur_index = w * (i) + (j + k);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  } // count R row

  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= param - 1; ++k) {
    if (j - k >= 0) {
      let cur_index = w * (i) + (j - k);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count L row
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= param - 1; ++k) {
    if (i - k >= 0) {
      let cur_index = w * (i - k) + (j);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count U column
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= param - 1; ++k) {
    if (i + k < h) {
      let cur_index = w * (i + k) + (j);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count D column

  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= param - 1; ++k) {
    if (j + k < w && i - k >= 0) {
      let cur_index = w * (i - k) + (j + k);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count RU diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= param - 1; ++k) {
    if (j + k < w && i + k < h) {
      let cur_index = w * (i + k) + (j + k);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count RD diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= param - 1; ++k) {
    if (j - k >= 0 && i - k >= 0) {
      let cur_index = w * (i - k) + (j - k);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
        cur_v = 0;
        break;
      }
    } else {
      break;
    }
  }// count LU diag
  value += cur_v;
  cur_v = 0;

  for (let k = 1; k <= param - 1; ++k) {
    if (j - k >= 0 && i + k < h) {
      let cur_index = w * (i + k) + (j - k);
      if (HasEl(cur_player_set, cur_index)) {
        cur_v += 1;
      } else if (HasEl(rival_set, cur_index)) {
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

function CountEmptyValue(index) { // функция подсчета потенциальных позиций
  let value = 0;
  let j = index % w;
  let i = (index - j) / w; // w * i + j
  let param = Math.min(x, y);

  for (let k = 1; k <= param - 1; ++k) {
    if (j + k < w) {
      let cur_index = w * (i) + (j + k);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    } // count R row
  }

  for (let k = 1; k <= param - 1; ++k) {
    if (j - k >= 0) {
      let cur_index = w * (i) + (j - k);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    }
  }// count L row

  for (let k = 1; k <= param - 1; ++k) {
    if (i - k >= 0) {
      let cur_index = w * (i - k) + (j);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    }
  }// count U column

  for (let k = 1; k <= param - 1; ++k) {
    if (i + k < h) {
      let cur_index = w * (i + k) + (j);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    }
  }// count D column

  for (let k = 1; k <= param - 1; ++k) {
    if (j + k < w && i - k >= 0) {
      let cur_index = w * (i - k) + (j + k);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    }
  }// count RU diag

  for (let k = 1; k <= param - 1; ++k) {
    if (j + k < w && i + k < h) {
      let cur_index = w * (i + k) + (j + k);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    }
  }// count RD diag

  for (let k = 1; k <= param - 1; ++k) {
    if (j - k >= 0 && i - k >= 0) {
      let cur_index = w * (i - k) + (j - k);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    }
  }// count LU diag

  for (let k = 1; k <= param - 1; ++k) {
    if (j - k >= 0 && i + k < h) {
      let cur_index = w * (i + k) + (j - k);
      if (!HasEl(cur_set, cur_index)) {
        value += empty_value ** k;
      }
    }
  }// count LD diag

  return value;
}

function FourLinesCounter(player, index, flag) { // для подсчета выигрыша
  let counter = 1;
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
    if (HasEl(player, cur_index)) {
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
    if (HasEl(player, cur_index)) {
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
    if (HasEl(player, cur_index)) {
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
    if (HasEl(player, cur_index)) {
      counter += 1;
    } else {
      break;
    }
  }

  return (param === counter);
}

function WinCheker() { // функция, смотрящая есть ли победитель
  for (let index = 0; index < h * w; ++index) {
    if (HasEl(player1_set, index) && FourLinesCounter(player1_set, index, 1)) {
        alert("First player is a winner!");
        return true;
    } else if (HasEl(player2_set, index) && FourLinesCounter(player2_set, index, 2)) {
        alert("Second player is a winner!");
        return true;
    }
  }
  return false;
}
<!--Блок взаимодействия компьютера или компа с интерфейсом-->
function ShowPrevPos() { // Функция показа предыдущей позиции в журнале
  if (cur_pos === 0) {
    alert('incorrect command');
  } else {
    --cur_pos;
    alert('prev turn = ' + cur_pos);
    let id = cur_arr[cur_pos];
    let el = document.getElementById(id); // находим индекс, откуда убераем камень
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
    let id = cur_arr[cur_pos]; // находим индекс, куда ставим камень
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

async function PutStone(id) { // функция вставки камня, обновления массивов
  if (HasEl(cur_set, id)) {
    alert("incorrect position");
    return;
  }
  let el = document.getElementById(id);
  if (turn_cnt % 2 === 0) {
    el.classList.add("dot1");
    player1_set.add(id);
  } else {
    el.classList.add("dot2");
    player2_set.add(id);
  }

  cur_arr.push(id);
  cur_set.add(id);
  ++turn_cnt;
  cur_pos = turn_cnt;
  human_turn = false;

  await delay(200);
  if (WinCheker()) { // проверяем, появился ли победитель
    alert("reset");
    ResetBoard();
  }
  if ((turn_cnt % 2 === 0 && !first_player_is_human) || (turn_cnt % 2 === 1 && !second_player_is_human)) {
      ReconstructBoardValues(); // следующим ходит комп
      await delay(1500);
      AIturn();
  } else { // следующим ходит человек
      human_turn = true;
  }
}

function AIturn() { // Ход компьютера
  PutStone(comp_turn);
  // RefreshStructures(comp_turn).then(r => alert("AIturn"));
}

function HumanTurn() { // Функция хода человека
  if (!human_turn) {
    return;
  }
  let id = event.srcElement.id;
  // RefreshStructures(id).then(r => alert("Human turn"));
  PutStone(id);
}


DrawBoard(); // Отрисовываем доску
