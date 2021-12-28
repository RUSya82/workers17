const childrensFields = document.querySelectorAll('.worker-child');
const selectField = document.querySelector('#classVariable');
const form = document.querySelector('.form');
let table = document.querySelector('.table');

let workers = [];

// событие изменения select - не имеет отношения к классу, поэтому он тут
selectField.addEventListener('change', (e) => {
    childrensFields.forEach(item => {
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
    let data = new FormData(form);  //забираем данные формы
    let body = {};
    data.forEach((item, index) => body[index] = item);//пишем данные в объект
    workers.push(WorkerFactoryMethod.getWorkerObject(body.profession, body));//создаем с помощью фабричного метода нужный объект
    form.reset();                                                                   //сброс формы
    childrensFields.forEach(item => item.classList.add('d-none'));  //прячем поля
    Worker.setToStorage();      //пишем в localStorage
    Worker.render();            //рендерим
})

class Worker{
    constructor({name, surname, phone, age}) {
        this.className = 'Worker';
        this.profession = '';
        this.name = name;
        this.surname = surname;
        this.phone = phone;
        this.age = age;
    }

    /**
     * Просто обёртка, которая возвращает столбец таблицы
     * @param text
     * @returns {HTMLTableDataCellElement}
     */
    getTD(text = ''){
        const td = document.createElement('td');
        td.innerHTML = text;
        return td;
    }

    /**
     * Геттер, который возвращает верстку строки таблицы данного объекта
     * @returns {HTMLTableRowElement}
     */
    get row(){
        const row = document.createElement('tr');
        row.append(this.getTD(this.fullName));
        row.append(this.getTD(this.phone));
        row.append(this.getTD(this.age));
        row.append(this.getTD(this.profession));
        return row;
    }

    /**
     * Забирает данные из localStorage и с помощью фабричного метода пишет их в массив
     */
    static getFromStorage(){
        let arr = localStorage.getItem('workers');
        if(arr){
            arr = JSON.parse(arr);
            workers.length = 0;
            arr.forEach(item => workers.push(WorkerFactoryMethod.getWorkerObject(item.className, item)));
        }
    }

    /**
     * пишет в localStorage массив данных
     */
    static setToStorage(){
        localStorage.clear();
        localStorage.setItem('workers', JSON.stringify(workers));
    }

    /**
     * рендер данных на страницу в виде таблицы
     */
    static render(){
        table.innerHTML = '';
        let fragment = document.createDocumentFragment();
        workers.forEach(item => {
            let row = item.row;         //получаем верстку объекта в виде строки таблицы
            let button = document.createElement('button');
            button.textContent = "Удалить";
            button.addEventListener('click', () => item.deleteElement()); //обработчик на кнопку
            let td = item.getTD("");
            td.append(button);
            row.append(td);
            fragment.append(row);
        })
        table.append(fragment)
    }
    /**
     * Геттер полного имени сотрудника
     */
    get fullName() {
        return this.name + " " + this.surname;
    }
    /**
     * Удаление элемента из массива данных
     */
    deleteElement(){
        let index = workers.findIndex(item => item === this);
        workers.splice(index,1);
        Worker.setToStorage();
        Worker.render();
    }
}
// Слесарь
class Locksmith extends Worker{
    constructor({name, surname, phone, age, education, pastJob}) {
        super({name, surname, phone, age});
        this.className = 'Locksmith';
        this.profession = 'Слесарь';
        this.education = education;
        this.pastJob = pastJob;
    }

    /**
     * Расширяем row родителя, добавляя свои поля таблицы
     * @returns {HTMLTableRowElement}
     */
    get row(){
        let newRow = super.row; //получаем row родителя
        newRow.append(this.getTD(this.education));  //добавляем свои данные
        newRow.append(this.getTD(this.pastJob));
        return newRow;
    }

}
// Водитель
class Driver extends Worker {
    constructor({name, surname, phone, age, experience, categories}) {
        super({name, surname, phone, age});
        this.className = 'Driver';
        this.profession = 'Водитель';
        this.experience = experience;
        this.categories = categories;
    }
    get row(){
        let newRow = super.row;
        newRow.append(this.getTD(this.experience));
        newRow.append(this.getTD(this.categories));
        return newRow;
    }
}
/**
 * Фабричный метод для создания объектов по имени класса
 * @param name - имя класса
 * @param data - объект, передаваемый в конструктор
 */
class WorkerFactoryMethod{
    static childrens = {
        Locksmith,
        Driver
    }
    static getWorkerObject(name, data){
        name = name[0].toUpperCase() + name.slice(1);
        return new WorkerFactoryMethod.childrens[name](data);
    }
}

Worker.getFromStorage();
Worker.render();
workers.forEach(item => console.log(item))