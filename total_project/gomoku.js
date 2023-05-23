var prev_clicker = '<button id="prev_pos" onclick="ShowPrevPos()">Show previous position</button>'
var next_clicker = '<button id="next_pos" onclick="ShowNextPos()">Show next position</button>'
var reset_clicker = '<button id="reset_id" onclick="ResetBoard()">Reset game</button>'
var turn_cnt = 0; <!--параметр, подсчитывающий количество сделанных ходов-->
var cur_pos = 0; <!--параметр текущей позиции-->
var h = 19; <!--параметр высоты-->
var w = 19; <!--параметр ширины-->
var x = 5; <!--параметр победы одного игрока-->
var y = 5; <!--параметр победы второго игрока-->
var human_turn = false; <!--параметр, позволяющий позволять человеку ходить-->
var comp_turn = 0; <!--параметр, отвечающий за индекс, куда компьютер будет ходить-->
var attack_const = 1.2; <!--параметр атаки-->
var defense_const = -1.; <!--параметр защиты-->
var caution_const = 1.; <!--параметр сдержанности-->
var empty_value = 0.005; <!--параметр ценности пусток клетки--> // useless now
var eps = 0.001; <!--параметр отклонения-->
var first_player_is_human; <!--булевый параметр-->
var second_player_is_human; <!--булевый параметр-->
var player1_arr = new Array(0); <!--Сет, поддерживающий все проставленные камни первым игроком-->
var player2_arr = new Array(0); <!--Сет, поддерживающий все проставленные камни вторым игроком-->
var cur_arr = new Array(0); <!--Массив, поддерживающий все проставленные камни-->
var array_of_turns = new Array(0);
var found_winner_flag = false;
var queue_type = 0;

const Turn = {
  first: 0,
  second: 1
};

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

function generateArray(n, p) {
  var arr = [];
  for (var i = 0; i < n; i++) {
    var num = Math.random();
    if (num < p) {
      arr.push(Turn.first);
    } else {
      arr.push(Turn.second);
    }
  }
  return arr;
}

<!--Блок, игровых функций-->
// TODO: time controller

function ConstructQueue() { // функция выплывающего окна с выбором очереди
  $(function() {
    $("#popup").dialog({ // всплывающее окно с тремя кнопками
      modal: true,
      buttons: {
        "The probability of the first player's move is р": function() {
          queue_type = 2;
          $(this).dialog("close");
          DrawBoard(); // Отрисовываем доску
        },
        "Prefix - Period": function() {
          queue_type = 1;
          $(this).dialog("close");
          DrawBoard(); // Отрисовываем доску
        },
        "Classic queue": function() {
          $(this).dialog("close");
          DrawBoard(); // Отрисовываем доску
        }
      }
    });
  });
}

function RefreshTurnWindow(n) {
  for (let i = 0; i < 5; ++i) {
    let el = document.getElementById(i + n);
    el.classList.remove("dot1");
    el.classList.remove("dot2");
  }

  for (let i = 0; i < 5; ++i) {
    let el = document.getElementById(i + n);
    if (n > turn_cnt && (array_of_turns[turn_cnt + i] === Turn.first)) {
      el.classList.add("dot1");
    } else if (n > turn_cnt && (array_of_turns[turn_cnt + i] === Turn.second)) {
      el.classList.add("dot2");
    }
  }
}

function TurnWindow(n) {
  let window = document.createElement('div');
  window.classList.add('window');
  window.append("Next five turns: ");

  for (let i = 0; i < 5; ++i) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('id', `${n + i}`);// создаем ячейки с уникальным id
    window.appendChild(cell);
  }
  $('.header').append(window);
}

function DrawBoard() { // функция отрисовки доски
  $('.header').append(prev_clicker); // добавляем в header кнопку отката назад
  $('.header').append(next_clicker); // добавляем в header кнопку отката вперед
  $('.header').append(reset_clicker); // добавляем в header кнопку перезапуска игры
  h = prompt("print board height", 19); // вводим параметр высоты доски
  w = prompt("print board width", 19); // вводим параметр ширины доски
  h = Math.min(h, 20);
  w = Math.min(w, 40);
  h = Math.max(1, h);
  w = Math.max(1, w);

  array_of_turns = new Array(h * w);
  if (queue_type === 0) { // классический вариант очереди
    for (let i = 0; i < h * w; ++i) {
      if (i % 2 === 0) {
        array_of_turns[i] = Turn.first;
      } else {
        array_of_turns[i] = Turn.second;
      }
    }
  } else if (queue_type === 1) { // генерируем последовательность из префикса и периода
    let prefix = prompt("print prefix: 0 - first player turn, 1 - second player turn", "01010011");
    let period = prompt("print period: 0 - first player turn, 1 - second player turn", "01");
    let ind = 0;
    for (let i of prefix) {
      if (i === "0") {
        array_of_turns[ind] = Turn.first;
      } else {
        array_of_turns[ind] = Turn.second;
      }
      ++ind;
      if (ind >= h * w) {
        break;
      }
    }
    while (ind < h * w) {
      for (let i of period) {
        if (i === "0") {
          array_of_turns[ind] = Turn.first;
        } else {
          array_of_turns[ind] = Turn.second;
        }
        ++ind;
        if (ind >= h * w) {
          break;
        }
      }
    }
  } else if (queue_type === 2) {
    let p = prompt("print probability of the first player's move", 50);
    array_of_turns = generateArray(h * w, p / 100); // генерируем случайную последовательность
  }


  first_player_is_human = confirm("Is first player a human?"); // назначаем первого игрока
  second_player_is_human = confirm("Is second player a human?"); // назначаем второго игрока
  x = prompt("print win parameter for first player", 5); // вводим параметр первого игрока
  y = prompt("print win parameter for second player", 5); // вводим параметр второго игрока
  x = Math.max(1, x);
  y = Math.max(1, y);
  x = Math.min(w * h, x);
  y = Math.min(w * h, y);
  <!--Построчно заполняем поле для игры-->
  let main_block = document.querySelector('.main-block');
  let board = document.createElement('div');
  board.classList.add('board');
  for (let i = 0; i < h; ++i) {
    const row = document.createElement('div');
    row.classList.add('row');
    for (let j = 0; j < w; ++j) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.setAttribute('id', `${i * w + j}`);// создаем ячейки с уникальным id
      cell.addEventListener('click', HumanTurn);
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
  main_block.appendChild(board);
  TurnWindow(w * h);
  RefreshTurnWindow(h * w);
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
  player1_arr = new Array(0);
  player2_arr = new Array(0);
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
  let our_set = player1_arr;
  let rival_set = player2_arr;
  let flag = 1;
  let rival_flag = 2;
  if (array_of_turns[turn_cnt] === Turn.second) {
    our_set = player2_arr;
    rival_set = player1_arr;
    flag = 2;
    rival_flag = 1;
  }

  let value = 0;
  let new_arr = new Array(0);
  for (let index = 0; index < h * w; ++index) {
    if (!HasEl(cur_arr, index)) { // Если есть элемент, то нет смысла подсчитывать ценность
      let attack = attack_const * CountCellValue(index, our_set, rival_set, flag); // A power
      if (found_winner_flag) {
        comp_turn = index;
        found_winner_flag = false;
        return;
      }
      let defense = defense_const * CountCellValue(index, rival_set, our_set, rival_flag); // D power
      if (found_winner_flag) {
        comp_turn = index;
        found_winner_flag = false;
        return;
      }
      value = attack - caution_const * defense; // ценность клетки (может меняться)
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
}

function CountCellValue(index, cur_player_set, rival_set, flag) { // функция посчета ценности клетки
  let value = 0;
  let j = index % w;
  let i = (index - j) / w; // w * i + j
  let param = x;
  let rival_param = y;
  if (flag === 2) {
    param = y;
    rival_param = x;
  }
  let cnt_of_stones = 0;
  let cnt_of_rival_stones = 0;
  let it_wont_fit = false;

  for (let index_pos = 0; index_pos < param; ++index_pos) { // horizontal values
    for (let k = 0 - index_pos; k < param - index_pos; ++k) {
      if (j + k < w && j + k >= 0) {
        let cur_index = w * (i) + (j + k);
        if (HasEl(cur_player_set, cur_index)) {
          cnt_of_stones += 1;
        } else if (HasEl(rival_set, cur_index)) {
          cnt_of_stones = 0;
          cnt_of_rival_stones += 1;
        }
      } else {
        it_wont_fit = true;
      }
    }
    if (it_wont_fit) {
      cnt_of_stones = -5 * param;
    }
    value += (param - cnt_of_stones);
    // value += cnt_of_stones;
    if (cnt_of_stones === param - 1 || (cnt_of_rival_stones === rival_param - 2)) {
      found_winner_flag = true;
      return value;
    }
    it_wont_fit = false;
    cnt_of_stones = 0;
    cnt_of_rival_stones = 0;
  }


  for (let index_pos = 0; index_pos < param; ++index_pos) { // column values
    for (let k = 0 - index_pos; k < param - index_pos; ++k) {
      if (i - k >= 0 && i - k < h) {
        let cur_index = w * (i - k) + (j);
        if (HasEl(cur_player_set, cur_index)) {
          cnt_of_stones += 1;
        } else if (HasEl(rival_set, cur_index)) {
          cnt_of_stones = 0;
          cnt_of_rival_stones += 1;
        }
      } else {
        it_wont_fit = true;
      }
    }
    if (it_wont_fit) {
      cnt_of_stones = -5 * param;
    }
    value += (param - cnt_of_stones);
    // value += cnt_of_stones;
    if (cnt_of_stones === param - 1 || (cnt_of_rival_stones === rival_param - 2)) {
      found_winner_flag = true;
      return value;
    }
    it_wont_fit = false;
    cnt_of_stones = 0;
    cnt_of_rival_stones = 0;
  }

  for (let index_pos = 0; index_pos < param; ++index_pos) { // main diag values
    for (let k = 0 - index_pos; k < param - index_pos; ++k) {
      if (i - k >= 0 && i - k < h && j - k < w && j - k >= 0) {
        let cur_index = w * (i - k) + (j - k);
        if (HasEl(cur_player_set, cur_index)) {
          cnt_of_stones += 1;
        } else if (HasEl(rival_set, cur_index)) {
          cnt_of_stones = 0;
          cnt_of_rival_stones += 1;
        }
      } else {
        it_wont_fit = true;
      }
    }
    if (it_wont_fit) {
      cnt_of_stones = -5 * param;
    }
    value += (param - cnt_of_stones);
    // value += cnt_of_stones;
    if (cnt_of_stones === param - 1 || (cnt_of_rival_stones === rival_param - 2)) {
      found_winner_flag = true;
      return value;
    }
    it_wont_fit = false;
    cnt_of_stones = 0;
    cnt_of_rival_stones = 0;
  }

  for (let index_pos = 0; index_pos < param; ++index_pos) { // main diag values
    for (let k = 0 - index_pos; k < param - index_pos; ++k) {
      if (i - k >= 0 && i - k < h && j + k < w && j + k >= 0) {
        let cur_index = w * (i - k) + (j + k);
        if (HasEl(cur_player_set, cur_index)) {
          cnt_of_stones += 1;
        } else if (HasEl(rival_set, cur_index)) {
          cnt_of_stones = 0;
          cnt_of_rival_stones += 1;
        }
      } else {
        it_wont_fit = true;
      }
    }
    if (it_wont_fit) {
      cnt_of_stones = -5 * param;
    }
    value += (param - cnt_of_stones);
    // value += cnt_of_stones;
    if (cnt_of_stones === param - 1 || (cnt_of_rival_stones === rival_param - 2)) {
      found_winner_flag = true;
      return value;
    }
    it_wont_fit = false;
    cnt_of_stones = 0;
    cnt_of_rival_stones = 0;
  }

  return 1 / value;
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
    if (HasEl(player1_arr, index) && FourLinesCounter(player1_arr, index, 1)) {
        alert("First player is a winner!");
        return true;
    } else if (HasEl(player2_arr, index) && FourLinesCounter(player2_arr, index, 2)) {
        alert("Second player is a winner!");
        return true;
    }
  }
  return false;
}
<!--Блок взаимодействия компьютера или компа с интерфейсом-->
function ShowPrevPos() { // Функция показа предыдущей позиции в журнале
  if (!WinCheker()) {
    return;
  }
  if (cur_pos === 0) {
    alert('incorrect command');
  } else {
    --cur_pos;
    // alert('prev turn = ' + cur_pos);
    let id = cur_arr[cur_pos];
    let el = document.getElementById(id); // находим индекс, откуда убераем камень
    if (array_of_turns[cur_pos] === Turn.first) {
      el.classList.remove("dot1");
    } else {
      el.classList.remove("dot2");
    }
  }

  human_turn = (array_of_turns[cur_pos] === Turn.first && first_player_is_human) || (array_of_turns[cur_pos] === Turn.second && second_player_is_human);
}

function ShowNextPos() { // функция, показывающая следующую позицию в журнале
  if (cur_pos === turn_cnt) {
    alert('incorrect command');
  } else {
    // alert('next turn = ' + (cur_pos + 1));
    let id = cur_arr[cur_pos]; // находим индекс, куда ставим камень
    let el = document.getElementById(id);
    // el.classList.add("dot");
    if (array_of_turns[cur_pos] === Turn.first) {
      el.classList.add("dot1");
    } else {
      el.classList.add("dot2");
    }
    ++cur_pos;
  }

  human_turn = (array_of_turns[cur_pos] === Turn.first && first_player_is_human) || (array_of_turns[cur_pos] === Turn.second && second_player_is_human);
}

async function PutStone(id) { // функция вставки камня, обновления массивов
  if (cur_pos !== turn_cnt && human_turn === true) {

    for (let i = turn_cnt; i > cur_pos; --i) {
      if (array_of_turns[i] === Turn.first) {
        player1_arr.pop();
      } else {
        player2_arr.pop();
      }
      cur_arr.pop();
    }

    turn_cnt = cur_pos;
    found_winner_flag = false;
  } else if (cur_pos !== turn_cnt && human_turn === false) {
    return;
  }
  if (HasEl(cur_arr, id)) {
    alert("incorrect position");
    return;
  }
  let el = document.getElementById(id);
  if (array_of_turns[turn_cnt] === Turn.first) {
    el.classList.add("dot1");
    player1_arr.push(id);
  } else {
    el.classList.add("dot2");
    player2_arr.push(id);
  }

  cur_arr.push(id);
  ++turn_cnt;
  cur_pos = turn_cnt;
  human_turn = false;

  await delay(200);
  if (WinCheker()) { // проверяем, появился ли победитель
    return;
  }
  if (turn_cnt === w * h) {
    alert("It is draw");
    return;
  }
  if ((array_of_turns[turn_cnt] === Turn.first && !first_player_is_human) || (array_of_turns[turn_cnt] === Turn.second && !second_player_is_human)) {
      ReconstructBoardValues(); // следующим ходит комп
      await delay(1000);
      AIturn();
  } else { // следующим ходит человек
      human_turn = true;
  }
  RefreshTurnWindow(h * w);
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


ConstructQueue(); // выбор очереди
