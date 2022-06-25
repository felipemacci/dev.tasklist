const Modal = {
    toggle() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const ThemeSwitcher = {
    isSwitched: false,

    toggle() {

        if(!this.isSwitched) {
            document.querySelector('body').classList.toggle('dark-theme')
            document.querySelector('.theme_Switcher').innerHTML = `<i class="uil uil-sun"></i>`
            this.isSwitched = true
        } else {
            document.querySelector('body').classList.toggle('dark-theme')
            document.querySelector('.theme_Switcher').innerHTML = `<i class="uil uil-moon"></i>`
            this.isSwitched = false
        }
    }
}

const Storage = {
    getTask() {
        return JSON.parse(localStorage.getItem('dev.tasklist:tasks')) || []
    },

    setTask(tasks) {
        localStorage.setItem("dev.tasklist:tasks", JSON.stringify(tasks))
    },

    getCompleted() {
        return JSON.parse(localStorage.getItem('dev.tasklist:completedTasks')) || []
    },

    setCompleted(task) {
        localStorage.setItem("dev.tasklist:completedTasks", JSON.stringify(task))
    },

    clear() {
        localStorage.clear()
    }
}

const Tasks = {
    all: Storage.getTask(),
    completed: Storage.getCompleted(),

    add(task) {
        Tasks.all.push(task)

        App.reload()
    },

    remove(id) {
        Tasks.all.forEach((item, index) => {
            if(item.id === id) {
                Tasks.all.splice(index, 1)
            }
        })

        App.reload()
    },

    conclude(id) {
        Tasks.completed.push(Tasks.all.find(item => item.id == id))

        Tasks.remove(id)

        App.reload()
    },

    calculate() {
        const waiting = Tasks.all.length + ' Task(s).'
        localStorage.setItem('dev.tasklist:waiting', waiting)

        const completed = Tasks.completed.length + ' Task(s).'
        localStorage.setItem('dev.tasklist:completed', completed)
    },

    clear() {
        Tasks.all = []
        Tasks.completed = []
        Storage.clear()
        App.reload()
    }
}

const TaskView = {
    tasksContainer: document.querySelector('#tasks'),

    add(task) {
        const template = `
        <div id="${task.id}" class="card">
            <header>
                <nav class="navbar">
                    <button class="complete_Task" title="Complete task"><i class="uil uil-check" onclick="Tasks.conclude(${task.id})"></i></button>
                    <button class="remove_Task" title="Remove task" onclick="Tasks.remove(${task.id})"><i class="uil uil-trash-alt"></i></button>
                </nav>
            </header> 

            <main>
                <h3>${task.title}</h3>
                <p>${task.description}</p>
            </main>

            <footer>
                <p>
                    <i class="uil uil-clock"></i>
                    <span>For ${task.date[0]} at ${task.date[1]}</span>
                </p>
            </footer>
        </div>
        `

        this.tasksContainer.innerHTML += template
    },

    clearTasks() {
        const tasks = this.tasksContainer.querySelectorAll('.card:not(.card--new)')

        tasks.forEach(item => item.remove())
    }
}

const Utils = {
    currentId: -1,

    formatDate(date) {
        date = date.split('T')
        
        date[0] = date[0].split('-')

        date[0] = `${date[0][2]}/${date[0][1]}/${date[0][0]}`

        return date
    },

    setId() {
        Utils.currentId++
        return Utils.currentId
    },

    setData() {
        Tasks.calculate()
        
        document.querySelector('#waiting p').innerText = localStorage.getItem('dev.tasklist:waiting')
        document.querySelector('#complete p').innerText = localStorage.getItem('dev.tasklist:completed')
    }
}

const Form = {
    title: document.querySelector('input#title'),
    description: document.querySelector('input#description'),
    date: document.querySelector('input#time'),

    getValues() {
        return {
            title: Form.title.value,
            description: Form.description.value,
            date: Form.date.value
        }
    },

    validateFields() {
        let { title, description, date } = Form.getValues()

        if(title === "" || description === "" || date === "")
            throw new Error("Please fill in all fields!")
    },

    formatValues() {
        let { title, description, date } = Form.getValues()

        date = Utils.formatDate(date)

        return {
            id: Utils.setId(),
            title,
            description,
            date
        }
    },

    clearFields() {
        Form.title.value = ""
        Form.description.value = ""
        Form.date.value = ""
    }, 

    submit(event) {
        try {
            Form.validateFields()

            const task = Form.formatValues()

            Tasks.add(task)

            Utils.setData()
            
            Form.clearFields()

            Modal.toggle()
        } catch (Error) {
            alert(Error.message)
        }

        event.preventDefault()
    }
}

const App = {
    init() {
        Tasks.all.forEach(task => TaskView.add(task))
        Storage.setTask(Tasks.all)
        Storage.setCompleted(Tasks.completed)
        Utils.setData()
    },

    reload() {
        TaskView.clearTasks()
        App.init()
    },

    reset() {
        Tasks.clear()
    }
}

App.init()