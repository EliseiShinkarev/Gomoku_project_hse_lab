let divSquare = '<div id="s$coord" onclick="PutStone(coord)" class="block"></div>'; <!--параметр высоты-->
let prev_clicker = '<button id="prev_pos" onclick="ShowPrevPos()">Посмотреть предыдущее состояние</button>'
let next_clicker = '<button id="next_pos" onclick="ShowNextPos()">Посмотреть следующее состояние</button>'
let turn_cnt = 0; // счетчик совершенных шагов
let cur_pos = 0; // индекс состояния, выведенного на доску
let cur_arr = new Array(0); <!--массив текущего состояния поля-->
let arr_of_prev_pos = new Array(0); <!--массив массивов, по которому востанавливаем предыдущие состояния-->
let h = 19; <!--параметр высоты-->
let w = 19; <!--параметр ширины-->
let x = 5;
let y = 5;
let coef = 0.5;
let human_turn = false;
let valuesboard = new Array(0);
// let PQ = new PriorityQueue();
let comp_turn = 0;
function DrawBoard() {
  $('.header').append(prev_clicker);
  $('.header').append(next_clicker); // добавляем кнопки состояний
  // в будущем будем перезаписывать ширину и высоту на другие параметры

  let first_player_is_human = confirm("Is first player a human?"); // узнаем, кто является игроком
  let second_player_is_human = confirm("Is second player a human?");

  x = prompt("print win parameter for first player", 5); // вводим параметры для победы
  y = prompt("print win parameter for second player", 5);

  valuesboard = new Array(h * w); // массив, в котором будем считать вес каждой ячейки

  for (let i = 0; i < h; ++i) {
    for (let j = 0; j < w; ++j) {
      $('.main-block').append(divSquare
        .replace('$coord', w * i + j)); <!--добавляем в исходное поле ячейку с соответствующими координатами-->
    }
  }
  Game(!first_player_is_human, !second_player_is_human); // после отрисовки запускаем игру
}
function AIturn() { // ход компьютера, почти аналогично функции PutStone

  let id = comp_turn;
  let el = document.getElementById(id);
  if (turn_cnt % 2 === 0) {
    el.classList.add("dot1");
  } else {
    el.classList.add("dot2");
  }

  cur_arr.push(id);
  ++turn_cnt;
  alert('current turn = ' + turn_cnt);
  cur_pos = turn_cnt;

  valuesboard[id] = -Infinity;
  human_turn = true;
}

function ReconstructBoardValues(is_comp1, is_comp2) { // шаблонно, пока не работает
  comp_turn += 1;
  Game(is_comp1, is_comp2)
}

function ShowPrevPos() {
  if (cur_pos === 0) { // если уже пустая доска
    alert('incorrect command');
  } else {
    --cur_pos;
    alert('prev turn = ' + cur_pos); // выводим предыдущее состояние, уменьшаем индекс
    let id = cur_arr[cur_pos];
    let el = document.getElementById(id); // достаем индекс, чтобы скрыть ячейку с фишкой
    if (cur_pos % 2 === 0) {
      el.classList.remove("dot1");
    } else {
      el.classList.remove("dot2");
    }
  }
}

function ShowNextPos() {
  if (cur_pos === turn_cnt) {
    alert('incorrect command'); // если больше ходов не было
  } else {
    alert('next turn = ' + (cur_pos + 1)); // выводим предыдущее состояние, увеличиваем индекс
    let id = cur_arr[cur_pos];
    let el = document.getElementById(id); // достаем индекс, чтобы заново отрисовать ячейку с фишкой
    // el.classList.add("dot");
    if (cur_pos % 2 === 0) {
      el.classList.add("dot1");
    } else {
      el.classList.add("dot2");
    }
    ++cur_pos;
  }
}

function PutStone() { // функция вызывется при нажатии на клетку
  let id = event.srcElement.id; // достаем индекс ячейки, на которую нажали
  let el = document.getElementById(id);
  // el.classList.add("dot");
  if (!human_turn) { // если ходить компьютер, то нажатие ничего не делает
    return;
  }

  if (cur_arr.includes(id)) { // если уже есть фишка, то ничего не делаем
    alert('incorrect pos');
  } else {
    if (cur_pos === turn_cnt) {
      if (turn_cnt % 2 === 0) {
        el.classList.add("dot1"); // отрисовываем фишку
      } else {
        el.classList.add("dot2");
      }
      human_turn = false;
      valuesboard[id] = Infinity;

      cur_arr.push(id); // запоминаем индекс новой фишки (нужно для журнала)
      ++turn_cnt;
      alert('current turn = ' + turn_cnt);
      cur_pos = turn_cnt;
    } else {
      alert('incorrect pos');
    }
  }
}

function Game(is_comp1, is_comp2) { // функция самой игры
  // TODO: time controller
  if (turn_cnt % 2 === 0) { // игрок 1
    if (is_comp1) {
      AIturn();
    } else {
      human_turn = true;
    }
  } else { // игрок 2
    if (is_comp2) {
      AIturn();
    } else {
      human_turn = true;
    }
  }
  ReconstructBoardValues(is_comp1, is_comp2); // refresh comp_turn, count new values
}

DrawBoard(); // отрисовываем доску


