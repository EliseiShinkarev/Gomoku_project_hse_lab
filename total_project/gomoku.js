let divSquare = '<div id="s$coord" onclick="PutStone(coord)" class="block"></div>'; <!--параметр высоты-->
let prev_clicker = '<button id="prev_pos" onclick="ShowPrevPos()">Посмотреть предыдущее состояние</button>'
let next_clicker = '<button id="next_pos" onclick="ShowNextPos()">Посмотреть следующее состояние</button>'
let turn_cnt = 0; // счетчик совершенных шагов
let cur_pos = 0; // индекс состояния, выведенного на доску
let cur_arr = new Array(0); <!--массив текущего состояния поля-->
let arr_of_prev_pos = new Array(0); <!--массив массивов, по которому востанавливаем предыдущие состояния-->
let h = 19; <!--параметр высоты-->
let w = 19; <!--параметр ширины-->
function DrawBoard() {
  $('.header').append(prev_clicker);
  $('.header').append(next_clicker); // добавляем кнопки состояний
  // в будущем будем перезаписывать ширину и высоту на другие параметры
  for (let i = 0; i < h; ++i) {
    for (let j = 0; j < w; ++j) {
      $('.main-block').append(divSquare
        .replace('$coord', w * i + j)); <!--добавляем в исходное поле ячейку с соответствующими координатами-->
    }
  }
}

function ShowArr(pos) { // нужно будет для отрисовки камней

}

function AIturn() { // ход компьютера
    
}

function ShowPrevPos() {
  if (cur_pos === 0) { // если уже пустая доска
    alert('incorrect command');
  } else {
    --cur_pos;
    alert('prev turn = ' + cur_pos); // выводим предыдущее состояние, уменьшаем индекс
    ShowArr(cur_pos);
  }
}

function ShowNextPos() {
  if (cur_pos === turn_cnt) {
    alert('incorrect command'); // если больше ходов не было
  } else {
    ++cur_pos;
    alert('next turn = ' + cur_pos); // выводим предыдущее состояние, увеличиваем индекс
    ShowArr(cur_pos);
  }
}

function PutStone() { // функция вызывется при нажатии на клетку
    if (cur_pos === turn_cnt) {
        ++turn_cnt;
        alert('current turn = ' + turn_cnt);
        cur_pos = turn_cnt; // увеличиваем индекс, ставим камень, вызывается ход компьютера
        AITurn();
    } else {
        alert('incorrect pos'); // в будущем перемодифицируем на перезапись состояний
    }
}

DrawBoard(); // отрисовываем доску


