let json = {};

function focusFilter() {
  document.getElementById("filter").select();
}

function inputChanged() {
  renderRight(document.getElementById('filter').value);
}

function setFilter(filter) {
  document.getElementById('filter').value = filter;
  renderRight(filter);
}

function renderSidenavList(list) {
  let html = "";
  for(let i of list) {
    html = html + "<a href=\"javascript:setFilter('" + i.name + "');\">" + i.name + "</a><br>";
  }

  return html;
}

function renderLeft() {
  document.getElementById("sidenav_statements").innerHTML = renderSidenavList(json.statements);
  document.getElementById("sidenav_expressions").innerHTML = renderSidenavList(json.expressions);
  document.getElementById("sidenav_structures").innerHTML = renderSidenavList(json.structures);
}

function renderList(filter, list) {
  let ret = "";
  for(let i of list) {
    if (!filter || i.name.toLowerCase().includes(filter.toLowerCase())) {
      ret = ret + "<div style=\"page-break-inside:avoid;\">" +
        "<u>" + i.name + "</u><br>" +
        "<a href=\"#/" + i.type + "/" + i.name + "\"><img src=\"" + i.type + "_" + i.name + ".svg\"></a></div><br>";
    }
  }
  return ret;
}

function renderRight(filter) {
  let html = "";

  const statements = renderList(filter, json.statements);
  if (statements !== "") {
    html = "<div style=\"page-break-before: always;\"><h1>Statements</h1>" + statements + "</div>";
  }

  const expressions = renderList(filter, json.expressions);
  if (expressions !== "") {
    html = html + "<div style=\"page-break-before: always;\"><h1>Expressions</h1>" + expressions + "</div>";
  }

  const structures = renderList(filter, json.structures);
  if (structures !== "") {
    html = html + "<div style=\"page-break-before: always;\"><h1>Structures</h1>" + structures + "</div>";
  }

  document.getElementById("main").innerHTML = html;
}

function renderSyntax(type, name) {
  // lookup
  let found = {};
  let prev = {};
  let next = {};
  let list = json[type+"s"];
  for (let index in list) {
    if (list[index].name === name) {
      found = list[index];
      prev = list[index - 1];
      next = list[index + 1];
    }
  }

  let html = "<h1>" + type + ": " + name + "</h1>\n" + found.svg + "<br>\n" +
  "<b>Using</b>: " + found.using.join(", ") + "<br>\n" +
  "<b>Used by</b>: todo<br>\n";

  if (prev) {
    html = html + "<b>Prev</b>: " + prev.name + "<br>\n";
  }
  if (next) {
    html = html + "<b>Next</b>: " + next.name + "<br>\n";
  }

  document.getElementById("body").innerHTML = html;
}

class Router {
  static popstate() {
    if(window.location.hash === "") {
      renderMain();
    } else {
      let split = window.location.hash.split("/");
      renderSyntax(split[1], split[2]);
    }
  }
}

function renderMain() {
  document.getElementById("body").innerHTML =
    "<div>\n" +
    "<div id=\"mySidenav\" class=\"sidenav sidenav-print\">\n" +
    "<h3>abaplint</h3>\n" +
    "<input type=\"text\" id=\"filter\" oninput=\"javascript:inputChanged();\" onfocus=\"javascript:focusFilter()\"></input><br>\n" +
    "<br>\n" +
    "<b>Statements</b><br>\n" +
    "<div id=\"sidenav_statements\">Loading</div>\n" +
    "<br>\n" +
    "<b>Expressions</b><br>\n" +
    "<div id=\"sidenav_expressions\">Loading</div>\n" +
    "<br>\n" +
    "<b>Structures</b><br>\n" +
    "<div id=\"sidenav_structures\">Loading</div>\n" +
    "</div>\n" +
    "<div id=\"main\" class=\"main main-print\">Loading</div>";

  document.getElementById("filter").focus();
  renderLeft();
  renderRight();
}

function run() {
  window.onpopstate = Router.popstate;
  json = data;
  Router.popstate();
}

run();