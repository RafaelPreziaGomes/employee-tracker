import express from "express";
import inquirer from "inquirer";
import mysql from "mysql2";
import cTable from "console.table";
import { CallTracker } from "assert";
import dotenv from "dotenv";
dotenv.config();
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "W@lker!",
  database: "tracker_db",
});
connection.connect(function (e) {
  if (e) return console.log(e);
  InquirerPrompt();
});
const InquirerPrompt = () => {
  inquirer.prompt([
    {
      type: "list",
      name: "choices",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add department",
        "Add role",
        "Add employee",
        "Update all departments",
        "Update employee infomation",
        "Exit",
      ],
    },
    (showDepartments = () => {
      console.log("All departments are showing.");
      connection.query(
        "SELECT department.id AS id, department.name AS department FROM department",
        (e, o) => {
          if (e) return console.log(e);
          console.table(o), InquirerPrompt();
        }
      );
    }),
    (showRoles = () => {
      console.log("Show all roles.");
      connection.query(
        "SELECT roles.id, roles.title, department.name AS department FROM roles LEFT JOIN department ON roles.department_id = department.id",
        (e, o) => {
          console.table(o), InquirerPrompt();
        }
      );
    }),
    (addRoles = () => {
      inquirer
        .prompt([
          { type: "input", name: "roles", message: "What do you want to add?" },
          {
            type: "input",
            name: "salary",
            message: "What is your yearly salary?",
          },
        ])
        .then((e) => {
          const o = [e.roles, e.salary];
          connection.query("SELECT name, id FROM department", (t, n) => {
            if (t) return console.log(t);
            const r = n.map(({ name: e, id: o }) => ({ name: e, value: o }));
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "department_var",
                  message: "What department is this role in?",
                  choices: r,
                },
              ])
              .then((t) => {
                const n = t.department_var;
                o.push(n);
                connection.query(
                  "INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)",
                  o,
                  (o, t) => {
                    if (o) return console.log(o);
                    console.log("Added" + e.roles + "to roles"), showRoles();
                  }
                );
              });
          });
        });
    }),
    (showEmployees = () => {
      console.log("All employees are showing.");
      connection.query(
        "SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.name AS department, roles.salary, CONCAT(mgr.first_name, mgr.last_name) AS manager FROM employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee mgr ON employee.manager_id = mgr.id",
        (e, o) => {
          if (e) return console.log(e);
          console.table(o), InquirerPrompt();
        }
      );
    }),
    (updateEmployee = () => {
      connection.query("SELECT * FROM employee", (e, o) => {
        o.map(({ id: e, first_name: o, last_name: t }) => ({
          name: o + " " + t,
          value: e,
        }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "name",
              message: "Which employee do we want to update?",
              choices: employees,
            },
          ])
          .then((e) => {
            const o = e.name,
              t = [];
            t.push(o);
            connection.query("SELECT * FROM role", (e, o) => {
              if (e) return console.log(e);
              const n = o.map(({ id: e, title: o }) => ({ name: o, value: e }));
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "role",
                    message: "What is the new role?",
                    choices: n,
                  },
                ])
                .then((e) => {
                  const o = e.role;
                  t.push(o);
                  let n = t[0];
                  (t[0] = o), (t[1] = n);
                  connection.query(
                    "UPDATE employee SET role_id = ? WHERE id = ?",
                    t,
                    (e, o) => {
                      if (e) return console.log(e);
                      console.log("Role has been updated."), showEmployees();
                    }
                  );
                });
            });
          });
      });
    }),
    (addDepartments = () => {
      inquirer
        .prompt([
          {
            type: "input",
            name: "department",
            message: "What department do you want to add?",
          },
        ])
        .then((e) => {
          connection.query(
            "INSERT INTO department (name) VALUES (?)",
            e.department,
            (o, t) => {
              if (o) return console.log(o);
              console.log("Added" + e.department + "to departments"),
                showDepartments();
            }
          );
        });
    }),
    (addEmployees = () => {
      inquirer
        .prompt([
          { type: "input", name: "first_name", message: "Your First Name?" },
          { type: "input", name: "last_name", message: "Your Last Name?" },
        ])
        .then((e) => {
          const o = [e.first_name, e.last_name];
          connection.query(
            "SELECT roles.id, roles.title FROM roles",
            (e, t) => {
              if (e) return console.log(e);
              const n = t.map(({ id: e, title: o }) => ({ name: o, value: e }));
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "role",
                    message: "What is your role?",
                    choices: n,
                  },
                ])
                .then((e) => {
                  e.roles;
                  o.push(n), showEmployees();
                })
                .then((e) => {
                  const { choices: o } = e;
                  "View all departments" === o && showDepartments(),
                    "View all roles" === o && showRoles(),
                    "View all employees" === o && showEmployees(),
                    "Add department" === o && addDepartments(),
                    "Add role" === o && addRoles(),
                    "Add employee" === o && addEmployees(),
                    "Update all departments" === o && allDepartments(),
                    "Update employee infomation" === o && employeeInfomation(),
                    "Exit" === o && connection.end();
                });
            }
          );
        });
    }),
    (allDepartments = () => {
      console.log("All departments are showing.");
      connection.query("SELECT * FROM department", (e, o) => {
        if (e) return console.log(e);
        console.table(o), InquirerPrompt();
      });
    }),
    (employeeInfomation = () => {
      console.log("All employee infomation is showing.");
      connection.query("SELECT * FROM employee", (e, o) => {
        if (e) return console.log(e);
        console.table(o), InquirerPrompt();
      });
    }),
    connection.connect((e) => {
      e ? console.log(e) : InquirerPrompt();
    }),
  ]);
};
