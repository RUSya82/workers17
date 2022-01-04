const childrensFields = document.querySelectorAll('.worker-child');
const selectField = document.querySelector('#classVariable');
const form = document.querySelector('.form');
let table = document.querySelector('.table');

let workers = [];

// событие изменения select - не имеет отношения к классу, поэтому он тут
selectField.addEventListener('change', (e) => {
    childrensFields.forEach(item => {
        //показываем нужный блок, остальные скрываем
        if(item.classList.contains(e.target.value)){
            item.classList.remove('d-none');
        } else {
            item.classList.add('d-none');
        }
    })
})

//событие отправки формы
form.addEventListener('submit', (e) => {
    e.preventDefault();
    //про FormData почитать  тут https://learn.javascript.ru/formdata
    let data = new FormData(form);  //забираем данные формы в ручную собирать лень:-)))
    let body = {};//пока пустой объект
    //у FormData есть метод forEach, просто запишем данные формы в объект
    data.forEach((item, index) => body[index] = item);//пишем данные в объект
    //ниже происходят два события:
    //у класса Worker есть статическая функция createElement, описание ниже, и на основе пергово параметра она
    //создает нам нужный объект. В body у нас уже есть нужная инфа, полученная из формы
    // фишка в том, что у меня конструктор принимает не параметры, а объект, потом просто деструктуризация и всё
    //по сути body - это и есть объект, который мы собрали из данных формы
    // нам нужно было только зацепиться за что то, что передало бы имя.
    // тут я зацепился за select.value
    console.log(body); // тут body вывел для тебя, глянь что там, при разных специальностях в форме
    workers.push(Worker.createElement(body.profession, body));
    form.reset();//сбрасываем форму
    childrensFields.forEach(item => item.classList.add('d-none'))//прячем доп поля
    Worker.setToStorage();//пишем
    Worker.render();//рендерим
})


class Worker{
    // как и писал выше - принимает объект в качестве параметра конструктора
    constructor({name, surname, phone, age}) {//деструктуризация
        this.className = 'Worker';
        this.profession = '';
        this.name = name;
        this.surname = surname;
        this.phone = phone;
        this.age = age;
    }
    // эта функция просто выдает нам элемент <td>text</td>
    getTD(text = ''){
        const td = document.createElement('td');
        td.innerHTML = text;
        return td;
    }
    // выдает нам всю строку таблицы в виде элемента DOM, с нужными свойствами класса
    getRow(){
        const row = document.createElement('tr');
        row.append(this.getTD(this.fullName));//имя и.т.д
        row.append(this.getTD(this.phone));
        row.append(this.getTD(this.age));
        row.append(this.getTD(this.profession));
        return row;
    }
    // получение из localStorage массива и сразу делаем из него массив нужных объектов
    static getFromStorage(){
        let arr = localStorage.getItem('workers');
        if(arr){
            arr = JSON.parse(arr);
            workers.length = 0;
            // ниже опять же пушим в workers, созданные элементы с помощью статической функции
            // тут зацепились за поле className, чтобы выбрать имя класса
            arr.forEach(item => workers.push(Worker.createElement(item.className, item)));
        }

    }
    // вот та самая createElement. Статическая, потому что работает в контексте класса, она не привязана к объекту
    static createElement(name, data={}){
        name = name.toLowerCase();// className с большой буквы, когда получаем данные в формы - с маленькой. Чуть может и костыль
        // ниже просто решаем, какой класс создать
        // в чем прикол? Если появится класс менеджера, ты просто создать потомка Worker и допишешь сюда ещё один else if
        //и всё будет работать
        if(name === 'locksmith'){
            return new Locksmith(data);
        } else if(name === 'driver'){
            return new Driver(data);
        } else {
            return null;
        }
    }
    // тут просто пишет в localStorage
    static setToStorage(){
        localStorage.clear();
        localStorage.setItem('workers', JSON.stringify(workers));
    }
    // рендер таблицы. Статическая, потому что рендерит всю таблицу, а не конкретный объект,
    // то есть не относится конкретно к объекту, к объекту отностится getRow, мы тут её и используем
    static render(){
        table.innerHTML = '';//чистим таблицу
        let fragment = document.createDocumentFragment();// про него читать тут https://habr.com/ru/post/413287/
        // ниже пробегаемся по всем объектам
        workers.forEach(item => {
            let row = item.getRow(); // у каждого потомка свой расширенный getRow, где он дописывает свои поля
            // но нам надо добавить кнопку и повесить на неё событие
            let button = document.createElement('button');
            button.textContent = "Удалить";
            // говорим, что при клике по кнопке нужно удалить себя из workers, остальную работу сделает сборщик мусора
            button.addEventListener('click', () => item.deleteElement())
            let td = item.getTD("");//пустой столбец
            td.append(button);// добавляем туда кнопку
            row.append(td); // добавляем к строке
            fragment.append(row);// строку добавляем к DocumentFragment
        })
        table.append(fragment)// добавляем DocumentFragment в таблицу, при этом DocumentFragment - это просто контейнер, он туда не добавляется, а добавляется лишь его содержимое. Читай ссылку выше
    }
    // просто геттер полного имени, нет смысла писать в таблицу отдельно имя и фамилию
    get fullName() {
        return this.name + " " + this.surname;
    }
    //метод удаления самого себя из workers
    deleteElement(){
        let index = workers.findIndex(item => item === this);//находим свой индекс
        workers.splice(index,1);//аннигилируем
        Worker.setToStorage();//пишем в localStorage
        Worker.render();// рендерим
    }
}
//класс слесаря
class Locksmith extends Worker{
    constructor({name, surname, phone, age, education, pastJob}) {
        //ниже просто расширяем конструктор
        super({name, surname, phone, age});
        this.className = 'Locksmith';
        this.profession = 'Слесарь';
        this.education = education;
        this.pastJob = pastJob;
    }
    getRow(){
        // помнишь метод getRow у родителя? Вот мы сначала вызываем его и пишем в переменную
        let newRow = super.getRow();
        //а потом просто добавляем свои поля, которых у родителя нет. ООП- сила)))
        newRow.append(this.getTD(this.education));
        newRow.append(this.getTD(this.pastJob));
        return newRow;
    }

}
// тут водитель
class Driver extends Worker {
    constructor({name, surname, phone, age, experience, categories}) {
        super({name, surname, phone, age});
        this.className = 'Driver';
        this.profession = 'Водитель';
        this.experience = experience;
        this.categories = categories;
    }
    getRow(){
        let newRow = super.getRow();
        newRow.append(this.getTD(this.experience));
        newRow.append(this.getTD(this.categories));
        return newRow;
    }
}

Worker.getFromStorage();
Worker.render();
workers.forEach(item => console.log(item))
