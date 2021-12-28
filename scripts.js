const childrensFields = document.querySelectorAll('.worker-child');
const selectField = document.querySelector('#classVariable');
const form = document.querySelector('.form');
let table = document.querySelector('.table');

let workers = [];

selectField.addEventListener('change', (e) => {
    childrensFields.forEach(item => {
        if(item.classList.contains(e.target.value)){
            item.classList.remove('d-none');
        } else {
            item.classList.add('d-none');
        }
    })
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let data = new FormData(form);
    let body = {};
    data.forEach((item, index) => body[index] = item);
    workers.push(Worker.createElement(body.profession, body));
    console.log(workers)
    form.reset();
    childrensFields.forEach(item => item.classList.add('d-none'))
    Worker.setToStorage();
    Worker.render();
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
    getTD(text = ''){
        const td = document.createElement('td');
        td.innerHTML = text;
        return td;
    }
    get row(){
        const row = document.createElement('tr');
        row.append(this.getTD(this.fullName));
        row.append(this.getTD(this.phone));
        row.append(this.getTD(this.age));
        row.append(this.getTD(this.profession));
        return row;
    }
    static getFromStorage(){
        let arr = localStorage.getItem('workers');
        if(arr){
            arr = JSON.parse(arr);
            workers = [];
            arr.forEach(item => workers.push(Worker.createElement(item.className, item)));
        }

    }
    static createElement(name, data={}){
        name = name.toLowerCase();
        if(name === 'locksmith'){
            return new Locksmith(data);
        } else if(name === 'driver'){
            return new Driver(data);
        } else {
            return null;
        }
    }
    static setToStorage(){
        localStorage.clear();
        localStorage.setItem('workers', JSON.stringify(workers));
    }
    static render(){
        table.innerHTML = '';
        let fragment = document.createDocumentFragment();
        workers.forEach(item => {
            let row = item.row;
            let button = document.createElement('button');
            button.textContent = "Удалить";
            button.addEventListener('click', () => item.deleteElement())
            let td = item.getTD("");
            td.append(button);
            row.append(td);
            fragment.append(row);
        })
        table.append(fragment)
    }
    get fullName() {
        return this.name + " " + this.surname;
    }
    deleteElement(){
        let index = workers.findIndex(item => item === this);
        workers.splice(index,1);
        Worker.setToStorage();
        Worker.render();
    }
}
class Locksmith extends Worker{
    constructor({name, surname, phone, age, education, pastJob}) {
        super({name, surname, phone, age});
        this.className = 'Locksmith';
        this.profession = 'Слесарь';
        this.education = education;
        this.pastJob = pastJob;
    }
    get row(){
        let newRow = super.row;
        newRow.append(this.getTD(this.education));
        newRow.append(this.getTD(this.pastJob));
        return newRow;
    }

}

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

Worker.getFromStorage();
Worker.render();
workers.forEach(item => console.log(item))