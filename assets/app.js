const TASKS_ARRAY_URL = 'https://arniamodule-1final-project.herokuapp.com/tasks/'

const tasksTable = document.getElementById('tasks-table')

const filtersDropdown = document.getElementById('filters-dropdown')
const selectedFilter = document.getElementById('selected-filter')
const allTasksFilterButton = document.getElementById('all-filter-button')
const forTodayFilterButton = document.getElementById('for-today-filter-button')
const lateFilterButton = document.getElementById('late-filter-button')
const concludedFilterButton = document.getElementById('concluded-filter-button')
const inWorkFilterButton = document.getElementById('in-work-filter-button')
const stoppedFilterButton = document.getElementById('stopped-filter-button')
const searchBar = document.getElementById('search-bar')

const numberHeader = document.getElementById('number-header')
const descriptionHeader = document.getElementById('description-header')
const dateHeader = document.getElementById('date-header')
const statusHeader = document.getElementById('status-header')

const NUMBER_REQUIRED = 'Por favor, informe o número da tarefa.'
const DESCRIPTION_REQUIRED = 'Por favor, informe a descrição da tarefa.'
const DATE_REQUIRED = 'Por favor, defina um prazo de conclusão para a tarefa.'
const STATUS_REQUIRED = 'Por favor, selecione o status da tarefa.'

const addTaskButton = document.getElementById('add-task')
const taskModal = document.getElementById('task-modal')
const confirmActionModal = document.getElementById('confirm-action-modal')

const taskTitle = document.getElementById('task-title')
const numberInput = document.getElementById('number-input')
const descriptionInput = document.getElementById('description-input')
const dateInput = document.getElementById('date-input')
const selectedStatusInput = document.getElementById('selected-status')
const selectedStatusError = document.getElementById('status-error')

const taskForm = document.getElementById('task-form')
const statusDropdown = document.getElementById('status-dropdown')
const concludedSelect = document.getElementById('concluded-status-select')
const inWorkSelect = document.getElementById('in-work-status-select')
const stoppedSelect = document.getElementById('stopped-status-select')
const submitButton = document.getElementById('task-submit-button')

const nextPageBtn = document.getElementById('table-next')
const previousPageBtn = document.getElementById('table-previous')
const ITENS_PER_PAGE = 8

let currentTask = null
let currentPage = 1


async function createTask(task) {
  await fetch(TASKS_ARRAY_URL, {
    method: "POST",
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  })
}

async function editTask(taskId, task) {
  await fetch(`${TASKS_ARRAY_URL}${taskId}`, {
    method: "PUT",
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  })
}

async function deleteTask(taskId) {
  openConfirmAction()
  confirmActionModal.innerHTML =
    `<main class="modal-content">
      <h1 class="title">Tem certeza que deseja excluir essa tarefa?</h1>
      <section class="modal-buttons">
        <div class="cancel-modal" onclick="closeConfirmAction()">Cancelar</div>
        <button id="confirmDelete" type="button" class="main-bordered-button" onclick="confirmDelete(${taskId})">Sim</button>
      </section>
    </main>`
}

function openConfirmAction() {
  confirmActionModal.classList.add('modal-active')
}

function closeConfirmAction() {
  confirmActionModal.classList.remove('modal-active')
}

async function confirmDelete(taskId) {
  await fetch(`${TASKS_ARRAY_URL}${taskId}`, {
    method: "DELETE"
  })
  location.reload()
}

async function openTask() {
  numberInput.setAttribute('placeholder', `${await maxTaskNumber()}`)
  numberInput.setAttribute('max', `${await maxTaskNumber()}`)
  taskModal.classList.add('modal-active')
}

addTaskButton.addEventListener('click', function () {
  openTask()
})

function closeTask() {
  taskModal.classList.remove('modal-active')
}

function clearForm() {
  taskTitle.innerHTML = 'Adicionar nova tarefa'
  numberInput.value = ''
  descriptionInput.value = ''
  dateInput.value = ''
  selectedStatusInput.value = ''
  let errorText = document.querySelectorAll('.error-text')
  errorText.forEach(element => {
    return element.innerHTML = ''
  })
}

function cancelTask() {
  clearForm()
  closeTask()
}

async function submitTask(task) {
  if (currentTask === null) {
    await createTask(task)
    location.reload()
  } else if (currentTask !== null) {
    await editTask(currentTask.id, task)
    location.reload()
  }
}

async function getTask(taskId) {
  const response = await fetch(`${TASKS_ARRAY_URL}${taskId}`)
  const task = await response.json()
  return task
}

async function editTaskModal(taskId) {
  currentTask = await getTask(taskId)
  taskTitle.innerHTML = 'Editar tarefa'
  numberInput.value = currentTask.Number
  descriptionInput.value = currentTask.Description
  dateInput.value = currentTask.Date
  selectedStatusInput.value = currentTask.Status
  openTask()
}

async function getTasksArray() {
  const response = await fetch(TASKS_ARRAY_URL)
  const tasks = await response.json()
  return tasks
}

async function maxTaskNumber() {
  let tasks = await getTasksArray()
  let tasksNumbers = await tasks.map((task) => {
    return task.Number
  })
  if (tasksNumbers.length > 0) {
    let max = await tasksNumbers.reduce(function (a, b) {
      return Math.max(a, b)
    })
    return parseInt(max) + 1
  } else {
    return 1
  }
}

async function findRepeatedNumber() {
  let tasks = await getTasksArray()
  let maxNumber = await maxTaskNumber()
  maxNumber = maxNumber.toString()
  let numberInputValue = numberInput.value

  if (currentTask !== null) {
    const repeatedNumberTasks = tasks.filter(task => {
      if (task.Number === numberInputValue && task.Number !== currentTask.Number && task.Number !== maxNumber) {
        return task
      }
    })
    if (repeatedNumberTasks.length > 0) {
      return repeatedNumberTasks[0]
    } else {
      return false
    }
  } else {
    const repeatedNumberTasks = tasks.filter(task => {
      if (task.Number === numberInputValue && task.Number !== maxNumber) {
        return task
      }
    })
    if (repeatedNumberTasks.length > 0) {
      return repeatedNumberTasks[0]
    } else {
      return false
    }
  }
}

async function replaceTask(taskId, taskNumber, task) {
  openConfirmAction()
  confirmActionModal.innerHTML =
    `<main class="modal-content">
      <h1 class="title">Já existe uma tarefa com o número ${taskNumber}, deseja substituí-la?</h1>
      <section class="modal-buttons">
        <div class="cancel-modal" onclick="closeConfirmAction()">Cancelar</div>
        <button id="confirm-replace" type="button" class="main-bordered-button")">Sim</button>
      </section>
    </main>`
  const confirmReplaceButton = document.getElementById('confirm-replace')
  confirmReplaceButton.addEventListener('click', async function () {
    await editTask(taskId, task)
    location.reload()
  })
}

async function showMessage(input, message, type) {
  let text
  if (input === selectedStatusInput) {
    text = selectedStatusError
  } else {
    text = input.parentNode.querySelector('small')
  }
  text.innerText = message
  input.classList.remove(`${type ? 'success' : 'error'}`)
  input.classList.add(`${type ? 'success' : 'error'}`)
  return type
}

async function showError(input, message) {
  return showMessage(input, message, false)
}
async function showSucces(input) {
  return showMessage(input, '', true)
}

async function hasValue(input, message) {
  if (input.value === '') {
    return showError(input, message)
  } else {
    return showSucces(input)
  }
}

async function validateNumber(input, requiredMessage) {
  const maxNumber = await maxTaskNumber()

  if (!await hasValue(input, requiredMessage)) {
    return false
  } else if (input.value > maxNumber) {
    await showError(input, `Por favor, insira um número menor ou igual a ${maxNumber}.`)
    return false
  } else {
    return true
  }
}

numberInput.addEventListener('blur', async function () {
  await validateNumber(numberInput, NUMBER_REQUIRED)
})

descriptionInput.addEventListener('blur', async function () {
  await hasValue(descriptionInput, DESCRIPTION_REQUIRED)
})

dateInput.addEventListener('blur', async function () {
  await hasValue(dateInput, DATE_REQUIRED)
})

function dropdownDisplay(dropdown) {
  if (dropdown === 'filters') {
    filtersDropdown.classList.toggle('dropdown-active')
  } else if (dropdown === 'status') {
    statusDropdown.classList.toggle('dropdown-active')
  }
}

selectedStatusInput.addEventListener('click', function () {
  dropdownDisplay('status')
})

concludedSelect.addEventListener('click', function () {
  selectedStatusInput.value = 'Concluída'
  dropdownDisplay('status')
})

inWorkSelect.addEventListener('click', function () {
  selectedStatusInput.value = 'Em andamento'
  dropdownDisplay('status')
})

stoppedSelect.addEventListener('click', function () {
  selectedStatusInput.value = 'Paralisada'
  dropdownDisplay('status')
})

searchBar.addEventListener('input', function () {
  currentPage = 1
  modifyClasses(tasksTable, tasksTableClasses, 2, 2, 'search')
  tasksTableClasses.splice(2, 2, 'search')
  printTasks()
})

taskForm.addEventListener('change', async function () {
  const numberValid = await validateNumber(numberInput, null)
  const descriptionValid = await hasValue(descriptionInput, null)
  const dateValid = await hasValue(dateInput, null)
  const statusValid = await hasValue(selectedStatusInput, null)

  if (numberValid && descriptionValid && dateValid && statusValid) {
    submitButton.classList.remove('disabled')
    submitButton.classList.add('active')
  } else {
    submitButton.classList.remove('active')
    submitButton.classList.add('disabled')
  }
})

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const taskNumber = taskForm.elements['number-input'].value
  const taskDescription = taskForm.elements['description-input'].value
  const taskDate = taskForm.elements['date-input'].value
  const taskStatus = taskForm.elements['selected-status'].value

  const task = {
    Number: taskNumber,
    Description: taskDescription,
    Date: taskDate,
    Status: taskStatus,
  }

  const numberValid = await validateNumber(numberInput, NUMBER_REQUIRED)
  const descriptionValid = await hasValue(descriptionInput, DESCRIPTION_REQUIRED)
  const dateValid = await hasValue(dateInput, DATE_REQUIRED)
  const statusValid = await hasValue(selectedStatusInput, STATUS_REQUIRED)

  const repeatedNumberTask = await findRepeatedNumber()
  const repeatedNumber = repeatedNumberTask.Number
  const repeatedNumberId = repeatedNumberTask.id

  if (numberValid && descriptionValid && dateValid && statusValid && repeatedNumberTask) {
    return replaceTask(repeatedNumberId, repeatedNumber, task)
  } else if (numberValid && descriptionValid && dateValid && statusValid) {
    return submitTask(task)
  }
})

let tasksTableClasses = ['number-ascending', undefined, undefined]

function modifyClasses(element, classArray, initialIndex, endIndex, className) {
  classArray.splice(initialIndex, endIndex, className)
  element.classList = classArray.join(' ')
}

selectedFilter.addEventListener('click', function () {
  dropdownDisplay('filters')
  currentPage = 1
})

allTasksFilterButton.addEventListener('click', function () {
  modifyClasses(tasksTable, tasksTableClasses, 1, 1, 'all-tasks')
  dropdownDisplay('filters')
  printTasks()
})

forTodayFilterButton.addEventListener('click', function () {
  modifyClasses(tasksTable, tasksTableClasses, 1, 1, 'for-today')
  selectedFilter.value = 'Hoje'
  dropdownDisplay('filters')
  printTasks()
})

lateFilterButton.addEventListener('click', function () {
  modifyClasses(tasksTable, tasksTableClasses, 1, 1, 'late')
  selectedFilter.value = 'Atrasadas'
  dropdownDisplay('filters')
  printTasks()
})

concludedFilterButton.addEventListener('click', function () {
  modifyClasses(tasksTable, tasksTableClasses, 1, 1, 'concluded')
  selectedFilter.value = 'Concluídas'
  dropdownDisplay('filters')
  printTasks()
})

inWorkFilterButton.addEventListener('click', function () {
  modifyClasses(tasksTable, tasksTableClasses, 1, 1, 'in-work')
  selectedFilter.value = 'Em andamento'
  dropdownDisplay('filters')
  printTasks()
})

stoppedFilterButton.addEventListener('click', function () {
  modifyClasses(tasksTable, tasksTableClasses, 1, 1, 'stopped')
  selectedFilter.value = 'Paralisada'
  dropdownDisplay('filters')
  printTasks()
})

function filterByClass(tasks) {
  let todayDate = new Date().toISOString().slice(0, 10)
  todayDate = new Date(todayDate + "T00:00:00.000-02:59")

  if (tasksTable.classList.contains('for-today')) {
    tasks = tasks.filter((task) => {
      let thisTaskDate = new Date(task.Date + "T00:00:00.000-03:00")
      return (todayDate.toLocaleDateString()) === thisTaskDate.toLocaleDateString()
    })
    return tasks
  }
  else if (tasksTable.classList.contains('concluded')) {
    tasks = tasks.filter((task) => {
      return task.Status === 'Concluída'
    })
    return tasks
  }
  else if (tasksTable.classList.contains('in-work')) {
    tasks = tasks.filter((task) => {
      return task.Status === 'Em andamento'
    })
    return tasks
  }
  else if (tasksTable.classList.contains('stopped')) {
    tasks = tasks.filter((task) => {
      return task.Status === 'Paralisada'
    })
    return tasks
  }
  else if (tasksTable.classList.contains('late')) {
    tasks = tasks.filter((task) => {
      return task.Status !== 'Concluída'
    })
    tasks = tasks.filter((task) => {
      let thisTaskDate = new Date(task.Date + "T00:00:00.000-03:00")
      return thisTaskDate.valueOf() < (todayDate.valueOf() - 86400000)
    })
    return tasks
  }
  else if (tasksTable.classList.contains('all-tasks')) {
    selectedFilter.value = 'Filtros'
    return tasks
  }
  return tasks
}

function search(array, classElement, searchBar) {
  if (classElement.classList.contains('search')) {
    searchBarValue = searchBar.value.toLowerCase()
    array = array.filter((task) => {
      return task.Description.toLowerCase().includes(searchBarValue)
    })
    return array
  }
  return array
}

function orderTasks(tasks) {
  if (tasksTable.classList.contains('numberAscending')) {
    tasks.sort((a, b) => {
      return parseInt(a.Number) < parseInt(b.Number) ? -1 : parseInt(a.Number) > parseInt(b.Number) ? 1 : 0
    })
    return tasks
  } else if (tasksTable.classList.contains('numberDescending')) {
    tasks.sort((a, b) => {
      return parseInt(a.Number) < parseInt(b.Number) ? 1 : parseInt(a.Number) > parseInt(b.Number) ? -1 : 0
    })
    return tasks
  }

  else if (tasksTable.classList.contains('descriptionAscending')) {
    tasks.sort((a, b) => {
      return a.Description < b.Description ? -1 : a.Description > b.Description ? 1 : 0
    })
    return tasks
  } else if (tasksTable.classList.contains('descriptionDescending')) {
    tasks.sort((a, b) => {
      return a.Description < b.Description ? 1 : a.Description > b.Description ? -1 : 0
    })
    return tasks
  }

  else if (tasksTable.classList.contains('dateAscending')) {
    tasks.sort((a, b) => {
      return a.Date < b.Date ? -1 : a.Date > b.Date ? 1 : 0
    })
    return tasks
  } else if (tasksTable.classList.contains('dateDescending')) {
    tasks.sort((a, b) => {
      return a.Date < b.Date ? 1 : a.Date > b.Date ? -1 : 0
    })
    return tasks
  }

  else if (tasksTable.classList.contains('statusAscending')) {
    tasks.sort((a, b) => {
      return a.Status < b.Status ? -1 : a.Status > b.Status ? 1 : 0
    })
    return tasks
  } else if (tasksTable.classList.contains('statusDescending')) {
    tasks.sort((a, b) => {
      return a.Status < b.Status ? 1 : a.Status > b.Status ? -1 : 0
    })
    return tasks
  }

  numberHeader.addEventListener('click', function () {
    if (tasksTableClasses[0] !== 'numberAscending') {
      modifyClasses(tasksTable, tasksTableClasses, 0, 1, 'numberAscending')
    }
    else if (tasksTableClasses[0] === 'numberAscending') {
      modifyClasses(tasksTable, tasksTableClasses, 0, 1, 'numberDescending')
    }
    printTasks()
  })

  descriptionHeader.addEventListener('click', function () {
    if (tasksTableClasses[0] !== 'descriptionAscending') {
      modifyClasses(tasksTable, tasksTableClasses, 0, 1, 'descriptionAscending')
    } else if (tasksTableClasses[0] === 'descriptionAscending') {
      modifyClasses(tasksTable, tasksTableClasses, 0, 1, 'descriptionDescending')
    }
    printTasks()
  })

  dateHeader.addEventListener('click', function () {
    if (tasksTableClasses[0] !== 'dateAscending') {
      modifyClasses(tasksTable, tasksTableClasses, 0, 1, 'dateAscending')
    } else if (tasksTableClasses[0] === 'dateAscending') {
      modifyClasses(tasksTable, tasksTableClasses, 0, 1, 'dateDescending')
    }
    printTasks()
  })

  statusHeader.addEventListener('click', function () {
    if (tasksTableClasses[0] !== 'statusAscending') {
      tasksTableClasses.splice(0, 1, 'statusAscending')
      tasksTable.classList = tasksTableClasses.join(' ')
    } else if (tasksTableClasses[0] === 'statusAscending') {
      tasksTableClasses.splice(0, 1, 'statusDescending')
      tasksTable.classList = tasksTableClasses.join(' ')
    }
    printTasks()
  })
  return tasks
}

async function pageNavigate(tasks, type) {
  const maxPage = Math.ceil(tasks.length / ITENS_PER_PAGE)
  if (type === "next" && currentPage < maxPage) {
    currentPage = currentPage + 1
  }
  else if (type === "previous" && currentPage > 1) {
    currentPage = currentPage - 1
  }
  printTasks()
}

nextPageBtn.addEventListener('click', async function () {
  let tasks = await processedTasks()
  pageNavigate(tasks, 'next')
})

previousPageBtn.addEventListener('click', async function () {
  let tasks = await processedTasks()
  pageNavigate(tasks, 'previous')
})

function paginate(array, currentPage, ITENS_PER_PAGE) {
  const firstIndex = (currentPage - 1) * ITENS_PER_PAGE
  const lastIndex = firstIndex + ITENS_PER_PAGE
  array = array.slice(firstIndex, lastIndex)
  return array
}

function tableTemplate(task) {
  const date = new Date(task.Date + "T00:00:00.000-03:00")
  return tasksTable.innerHTML = tasksTable.innerHTML +
    `<tr>
      <td>${task.Number}</th>
      <td>${task.Description}</td>
      <td>${date.toLocaleDateString("pt-BR")}</td>
      <td class="${task.Status.replace(' ', '-')}">${task.Status}</td>
      <td id="task-functions">
        <i id="editButton" onclick="editTaskModal(${task.id})"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.4 13.575H0.6C0.268125 13.575 0 13.8431 0 14.175V14.85C0 14.9325 0.0675 15 0.15 15H14.85C14.9325 15 15 14.9325 15 14.85V14.175C15 13.8431 14.7319 13.575 14.4 13.575ZM2.73188 12C2.76938 12 2.80688 11.9963 2.84438 11.9906L5.99813 11.4375C6.03562 11.43 6.07125 11.4131 6.0975 11.385L14.0456 3.43687C14.063 3.41953 14.0768 3.39892 14.0862 3.37624C14.0956 3.35356 14.1005 3.32924 14.1005 3.30469C14.1005 3.28013 14.0956 3.25582 14.0862 3.23313C14.0768 3.21045 14.063 3.18985 14.0456 3.1725L10.9294 0.054375C10.8938 0.01875 10.8469 0 10.7963 0C10.7456 0 10.6988 0.01875 10.6631 0.054375L2.715 8.0025C2.68687 8.03063 2.67 8.06437 2.6625 8.10188L2.10938 11.2556C2.09113 11.3561 2.09765 11.4594 2.12836 11.5568C2.15907 11.6542 2.21305 11.7426 2.28562 11.8144C2.40937 11.9344 2.565 12 2.73188 12Z"
              fill="#2C2661" />
          </svg>
        </i>
        <i id="deleteButton" onclick="deleteTask(${task.id})"
          ><svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.4167 2.7H11.0833V1.2C11.0833 0.538125 10.5602 0 9.91667 0H4.08333C3.43984 0 2.91667 0.538125 2.91667 1.2V2.7H0.583333C0.260677 2.7 0 2.96813 0 3.3V3.9C0 3.9825 0.065625 4.05 0.145833 4.05H1.24687L1.69714 13.8563C1.7263 14.4956 2.24036 15 2.86198 15H11.138C11.7615 15 12.2737 14.4975 12.3029 13.8563L12.7531 4.05H13.8542C13.9344 4.05 14 3.9825 14 3.9V3.3C14 2.96813 13.7393 2.7 13.4167 2.7ZM9.77083 2.7H4.22917V1.35H9.77083V2.7Z"
              fill="#D7CAE5"/>
          </svg>
        </i>
      </td>
    </tr>`
}

async function processedTasks() {
  let tasks = await getTasksArray()
  tasks = orderTasks(tasks)
  tasks = filterByClass(tasks)
  tasks = search(tasks, tasksTable, searchBar)
  return tasks
}

async function printTasks() {
  let tasks = await processedTasks()
  tasks = paginate(tasks, currentPage, ITENS_PER_PAGE)
  tasksTable.innerHTML = ""
  tasks.forEach((task) => {
    tableTemplate(task)
  })
}

document.addEventListener('DOMContentLoaded', function () {
  printTasks()
})
