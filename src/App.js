import React, { Component } from "react";
import classNames from "classnames";
import { connect } from 'react-redux';
import { AppTopbar } from "./AppTopbar";
import { Route, Redirect } from "react-router-dom";
import { AppMenu } from "./AppMenu";
import AppProfile from "./AppProfile";
import Teacher from './pages/teacher/Teacher';
import Student from './pages/student/Student';
import Admin from './pages/admin/Admin';
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "@fortawesome/free-solid-svg-icons";
import "./CustomIcons.css";
import "./Layout/layout.scss";
import "./Login/Login";
import Login from "./Login/Login";
import LogOut from './pages/LogOut';
import pcampus from "./images/pcampus.jpg";
import "primereact/resources/themes/saga-green/theme.css";
import "./Layout/layout.scss"
import PrimeReact from 'primereact/utils';
class App extends Component {
 
  constructor() {
    super();
    this.state = {
      layoutMode: "static",
      layoutColorMode: "light",
      /* Make this True for default Slidebar Close */
      staticMenuInactive: false,
      overlayMenuActive: false,
      mobileMenuActive: false
    };
 PrimeReact.ripple = true;
    this.onWrapperClick = this.onWrapperClick.bind(this);
    this.onToggleMenu = this.onToggleMenu.bind(this);
    this.onSidebarClick = this.onSidebarClick.bind(this);
    this.onMenuItemClick = this.onMenuItemClick.bind(this);
  }

  onWrapperClick(event) {
    if (!this.menuClick) {
      this.setState({
        overlayMenuActive: false,
        mobileMenuActive: false
      });
    }

    this.menuClick = false;
  }

  onToggleMenu(event) {
    this.menuClick = true;

    if (this.isDesktop()) {
      if (this.state.layoutMode === "overlay") {
        this.setState({
          overlayMenuActive: !this.state.overlayMenuActive
        });
      } else if (this.state.layoutMode === "static") {
        this.setState({
          staticMenuInactive: !this.state.staticMenuInactive
        });
      }
    } else {
      const mobileMenuActive = this.state.mobileMenuActive;
      this.setState({
        mobileMenuActive: !mobileMenuActive
      });
    }

    event.preventDefault();
  }

  onSidebarClick(event) {
    this.menuClick = true;
  }

  onMenuItemClick(event) {
    if (!event.item.items) {
      this.setState({
        overlayMenuActive: false,
        mobileMenuActive: false
      });
    }
  }

  createMenu() {
    if (this.props.role === 'teacher') {
      this.menu = [
        {
          label: "Teacher DashBoard",
          icon: "pi pi-fw pi-home",
          command: () => {
            window.location = "#/";
          }
        },
        {
          label: "Teacher Timeline",
          icon: "pi pi-fw pi-globe",
          command: () => {
            window.location = "#/timeline";
          }
        },
        {
          label: "Section Dashboard",
          icon: "pi pi-fw pi-users",
          command: () => {
            window.location = "#/marksview";
          }
        },
        {
          label: "Marks Edit Mode",
          icon: "pi pi-fw pi-user-edit",
          command: () => {
            window.location = "#/marksentry";
          }
        },
        {
          label: "Score Statistics",
          icon: "pi pi-fw pi-chart-bar",
          command: () => {
            window.location = "#/statistics";
          }

        },
        {
          label: "Log Out",
          icon: "pi pi-fw pi-sign-out",
          command: () => {
            window.location = "#/logout";
          }
        }
      ];
    } else if (this.props.role === 'student') {
      this.menu = [
        {
          label: "Student Timeline",
          icon: "pi pi-fw pi-globe",
          command: () => {
            window.location = "#/studenttimeline";
          }
        },
        {
          label: "Student Dashboard",
          icon: "pi pi-fw pi-home",
          command: () => {
            window.location = "#/";
          }
        },
        {
          label: "Subject Marks",
          icon: "pi pi-fw pi-users",
          command: () => {
            window.location = "#/marksview";
          }
        },
        {
          label: "Log Out",
          icon: "pi pi-fw pi-sign-out",
          command: () => {
            window.location = "#/logout";
          }
        }
      ];
    } else if (this.props.role === 'admin') {
      this.menu = [
        {
          label: "Admin Home",
          icon: "pi pi-fw pi-eye",
          command: () => {
            window.location = "#/admindashboard";
          }
        },
        {
          label: "Admin Dashboard",
          icon: "pi pi-fw pi-home",
          command: () => {
            window.location = "#/";
          }
        },
        {
          label: "Teacher Sessions",
          icon: "pi pi-fw pi-calendar",
          command: () => {
            window.location = '#/teachersessions';
          }
        },
        {
          label: "Log Out",
          icon: "pi pi-fw pi-sign-out",
          command: () => {
            window.location = "#/logout";
          }
        }
      ];
    }
  }

  addClass(element, className) {
    if (element.classList) element.classList.add(className);
    else element.className += " " + className;
  }

  removeClass(element, className) {
    if (element.classList) element.classList.remove(className);
    else
      element.className = element.className.replace(
        new RegExp(
          "(^|\\b)" + className.split(" ").join("|") + "(\\b|$)",
          "gi"
        ),
        " "
      );
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }

  componentDidUpdate() {
    if (this.state.mobileMenuActive)
      this.addClass(document.body, "body-overflow-hidden");
    else this.removeClass(document.body, "body-overflow-hidden");
  }

  render() {
    if (!this.props.isAuthenticated){
      return <Login/>
    }
    else {
      this.createMenu();
      const wrapperClass = classNames("layout-wrapper", {
        "layout-overlay": this.state.layoutMode === "overlay",
        "layout-static": this.state.layoutMode === "static",
        "layout-static-sidebar-inactive":
          this.state.staticMenuInactive && this.state.layoutMode === "static",
        "layout-overlay-sidebar-active":
          this.state.overlayMenuActive && this.state.layoutMode === "overlay",
        "layout-mobile-sidebar-active": this.state.mobileMenuActive
      });

      const sidebarClassName = classNames("layout-sidebar", {
        "layout-sidebar-light": this.state.layoutColorMode === "light"
      });

      let renderComponent = null
      switch (this.props.role){
        case 'admin': renderComponent = <Admin/>;
          break;
        case 'teacher': renderComponent = <Teacher/>;
          break;
        case 'student': renderComponent = <Student/>;
          break;
        default: renderComponent = null;
      }

      return (
        <div className={wrapperClass} onClick={this.onWrapperClick}>
          <AppTopbar onToggleMenu={this.onToggleMenu} />

          <div ref={(el) => (this.sidebar = el)} className={sidebarClassName} onClick={this.onSidebarClick}>
            <div className="layout-logo">
              <img alt="Logo" width="250px" src={pcampus}/>
            </div>
            <AppProfile />
            <AppMenu model={this.menu} onMenuItemClick={this.onMenuItemClick} />
          </div>

          <Route path="/logout" exact component={LogOut}/>
          {renderComponent}
          <Redirect to='/'/>

          <div className="layout-mask"></div>
        </div>
      );
    }
  }
}

const mapStateToProps = state => {
  return {
      role: state.auth.role,
      isAuthenticated: state.auth.token !== null
  };
};

export default connect( mapStateToProps, null )( App );
