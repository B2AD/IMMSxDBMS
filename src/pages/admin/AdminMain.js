import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import '../../index.css';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import classNames from 'classnames';
// import CSVReader from 'react-csv-reader';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import * as actions from '../../store/actions/admin';
import * as uris from '../../store/uris';
import './AdminMain.css';

class AdminMain extends Component {
    emptyTeacher = {
        person_id: '',
        username: '',
        full_name: '',
        email: '',
        phone_no: '',
        program_code: ''
    };

    constructor(props) {
        super();

        this.state = {
            redirect: null,
            newTeacher: null,
            teacherDialog: false,
            department: [],
            deleteTeacherDialog: false,
            deleteTeachersDialog: false,
            teacher: this.emptyTeacher,
            selectedTeachers: null,
            submitted: false,
            globalFilter: null
        };

        this.leftToolbarTemplate = this.leftToolbarTemplate.bind(this);
        this.rightToolbarTemplate = this.rightToolbarTemplate.bind(this);
        this.actionBodyTemplate = this.actionBodyTemplate.bind(this);

        this.openNew = this.openNew.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.saveTeacher = this.saveTeacher.bind(this);
        this.editTeacher = this.editTeacher.bind(this);
        this.confirmDeleteTeacher = this.confirmDeleteTeacher.bind(this);
        this.deleteTeacher = this.deleteTeacher.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.confirmDeleteSelected = this.confirmDeleteSelected.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onProgramChange = this.onProgramChange.bind(this);
        this.hideDeleteTeacherDialog = this.hideDeleteTeacherDialog.bind(this);
        this.hideDeleteTeachersDialog = this.hideDeleteTeachersDialog.bind(this);
    }

    componentDidMount() {
        if (this.props.infoBox) {
          this.toast.show({severity: 'info', summary: this.props.infoBox.summary, detail: this.props.infoBox.detail})
        }
        this.props.setInfoBoxNULL();
        fetch(uris.FETCH_DEPARTMENT_LIST, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    this.setState({department: res.data})
                } else {
                    this.toast.show({severity: 'error', summary: 'Department List Fetch Failed', detail: res.message});
                }
            })
            .catch(err => console.log(err))
    }

    openNew() {
        this.setState({
            teacher: this.emptyTeacher,
            submitted: false,
            newTeacher: true,
            teacherDialog: true
        });
    }

    hideDialog() {
        this.setState({
            submitted: false,
            teacherDialog: false
        });
    }

    hideDeleteTeacherDialog() {
        this.setState({ deleteTeacherDialog: false });
    }

    hideDeleteTeachersDialog() {
        this.setState({ deleteTeachersDialog: false });
    }

    saveTeacher() {
        let state = { submitted: true };
        if (this.state.teacher.username && this.state.teacher.full_name && this.state.teacher.email
            && this.state.teacher.phone_no && this.state.teacher.program_code) {
            let toastMsg = null;
            let method = null;
            if (!this.state.newTeacher) {
                method = 'PATCH';
                toastMsg = 'Teacher Updated';
            }
            else {
                method = 'POST';
                toastMsg = 'Teacher Created';
            }
            let i;
            for (i=0; i<this.state.department.length;i++){
                if (this.state.department[i].dept_name === this.state.teacher.program_code.dept_name) break;
            }
            let temp = {...this.state.teacher, dept_id: this.state.department[i].dept_id};
            fetch(uris.ADD_TEACHER+this.state.teacher.person_id.toString(), {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(temp)
            })
                .then(res => res.json())
                .then((res) => {
                    if (res.status === 'success') {
                        fetch(uris.FETCH_TEACHER_LIST, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        })
                            .then(res => res.json())
                            .then(res => {
                                if (res.status === 'success') {
                                    this.props.setTeachers(res.data)
                                } else {
                                    this.toast.show({severity: 'error', summary: 'Teacher List Fetch Failed', detail: res.message});
                                }
                            })
                            .catch(err => console.log(err))
                    } else {
                        this.toast.show({severity: 'error', summary: 'Teacher Update Failed', detail: res.message});
                    }
                })
                .catch(err => console.log(err))
            this.toast.show({ severity: 'success', summary: 'Successful', detail: toastMsg, life: 3000 });

            state = {
                ...state,
                newTeacher: false,
                teacherDialog: false,
                teacher: this.emptyTeacher
            };
        }

        this.setState(state);
    }

    editTeacher(teacher) {
        this.setState({
            teacher: { ...teacher },
            teacherDialog: true
        });
    }

    teacherClickHandler(rowData){
        this.props.selectCard(rowData.person_id);
		this.setState({redirect: <Redirect to='/teachersessions'/>});
    }

    confirmDeleteTeacher(teacher) {
        this.setState({
            teacher: { ...teacher},
            deleteTeacherDialog: true
        });
    }

    deleteTeacher() {
        let teachers = this.props.teachers.filter(val => val.person_id !== this.state.teacher.person_id);
        fetch(uris.DELETE_TEACHER+this.state.teacher.person_id.toString(), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    this.setState({
                        deleteTeacherDialog: false,
                        teacher: this.emptyTeacher
                    });
                    this.props.setTeachers(teachers);
                } else {
                    this.toast.show({severity: 'error', summary: 'Teacher Fetch Failed', detail: res.message});
                }
            })
            .catch(err => console.log(err))
        
        this.toast.show({ severity: 'success', summary: 'Successful', detail: 'Teacher Deleted', life: 3000 });
    }

    findIndexByUsername(id) {
        let index = -1;
        for (let i = 0; i < this.props.teachers.length; i++) {
            if (this.props.teachers[i].username === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    createId() {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    confirmDeleteSelected() {
        this.setState({ deleteTeachersDialog: true });
    }

    onInputChange(e, name) {
        const val = (e.target && e.target.value) || '';
        let teacher = {...this.state.teacher};
        teacher[`${name}`] = val;

        this.setState({ teacher });
    }

    onProgramChange(e) { this.setState({teacher: {...this.state.teacher, program_code: e.value}})}

    leftToolbarTemplate() {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" className="p-button-success p-mr-2" onClick={this.openNew} />
            </React.Fragment>
        )
    }

    rightToolbarTemplate() {
        return (
            <React.Fragment>
                {/* <CSVReader onFileLoaded={(data, fileInfo) => console.log(data[0])} /> */}
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={this.exportCSV} />
            </React.Fragment>
        )
    }

    actionBodyTemplate(rowData) {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => this.editTeacher(rowData)} />
                <Button icon='pi pi-briefcase' className="p-button-rounded p-button-info p-mr-2" onClick={() => this.teacherClickHandler(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-mr-2" onClick={() => this.confirmDeleteTeacher(rowData)} />
            </React.Fragment>
        );
    }

    render() {
        const header = (
            <div className="table-header">
                <h5 className="p-m-0">Manage Teachers</h5>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => this.setState({ globalFilter: e.target.value })} placeholder="Search..." />
                </span>
            </div>
        );
        const teacherDialogFooter = (
            <React.Fragment>
                <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={this.hideDialog} />
                <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={this.saveTeacher} />
            </React.Fragment>
        );
        const deleteTeacherDialogFooter = (
            <React.Fragment>
                <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideDeleteTeacherDialog} />
                <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.deleteTeacher} />
            </React.Fragment>
        );

        return (<Fragment>
            <Toast style={{zIndex: 10000}} ref={(el) => this.toast = el} />
            {this.props.loading ?  <div style={{paddingTop: '50px'}}><ProgressSpinner style={{width: '100%'}}/></div> :
            <div className="datatable-crud-demo">
            <div className="card">
                <Toolbar className="p-mb-4" style={{marginTop: '20px'}} left={this.leftToolbarTemplate} right={this.rightToolbarTemplate}></Toolbar>
                <DataTable ref={(el) => this.dt = el} value={this.props.teachers}
                    dataKey="id" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} teachers"
                    globalFilter={this.state.globalFilter}
                    header={header}>

                    <Column field="username" style={{width: '150px'}} header="UserName" sortable></Column>
                    <Column field="full_name" style={{width: '150px'}} header="Full Name" sortable></Column>
                    <Column field="email" style={{width: '350px'}} header="Email" ></Column>
                    <Column field="phone_no" style={{width: '120px'}} header="Phone No"  ></Column>
                    <Column field="dept_name" header="Department" sortable></Column>
                    <Column body={this.actionBodyTemplate}></Column>
                </DataTable>
            </div>

            <Dialog visible={this.state.teacherDialog} style={{ width: '450px' }} header="Teacher Details" modal className="p-fluid" footer={teacherDialogFooter} onHide={this.hideDialog}>
                <div className="p-field">
                    <label htmlFor="username">UserName</label>
                    <InputText id="username" value={this.state.teacher.username} onChange={(e) => this.onInputChange(e, 'username')} required autoFocus className={classNames({ 'p-invalid': this.state.submitted && !this.state.teacher.username })} />
                    {this.state.submitted && !this.state.teacher.username && <small className="p-invalid">UserName is required.</small>}
                </div>
                <div className="p-field">
                    <label htmlFor="full_name">Name</label>
                    <InputText id="full_name" value={this.state.teacher.full_name} onChange={(e) => this.onInputChange(e, 'full_name')} required autoFocus className={classNames({ 'p-invalid': this.state.submitted && !this.state.teacher.full_name })} />
                    {this.state.submitted && !this.state.teacher.full_name && <small className="p-invalid">Name is required.</small>}
                </div>
                 <div className="p-field">
                    <label htmlFor="email">Email</label>
                    <InputText id="email" value={this.state.teacher.email} onChange={(e) => this.onInputChange(e, 'email')} required autoFocus className={classNames({ 'p-invalid': this.state.submitted && !this.state.teacher.email })} />
                    {this.state.submitted && !this.state.teacher.email && <small className="p-invalid">Email is required.</small>}
                </div>
                 <div className="p-field">
                    <label htmlFor="phone_no">Phone No:</label>
                    <InputText id="phone_no" value={this.state.teacher.phone_no} onChange={(e) => this.onInputChange(e, 'phone_no')} required autoFocus className={classNames({ 'p-invalid': this.state.submitted && !this.state.teacher.phone_no })} />
                    {this.state.submitted && !this.state.teacher.phone_no && <small className="p-invalid">Phone No is required.</small>}
                </div>
                <div>
                    <label htmlFor="Department">Department</label>
                    <Dropdown value={this.state.teacher.program_code} options={this.state.department} onChange={this.onProgramChange} optionLabel="dept_name" required placeholder="Select a Department"/>
                    {this.state.submitted && !this.state.teacher.program_code && <small className="p-invalid">Department is required.</small>}
                </div>
            </Dialog>

            <Dialog visible={this.state.deleteTeacherDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTeacherDialogFooter} onHide={this.hideDeleteTeacherDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} />
                    {this.state.teacher && <span>Are you sure you want to delete <b>{this.state.teacher.full_name}</b>?</span>}
                </div>
            </Dialog>
        </div>}
        {this.state.redirect}
        </Fragment>
        );
    }
}
                
const mapStateToProps = state => {
    return {
      teachers: state.admin.teachers,
      infoBox: state.admin.infoBox,
      loading: state.admin.loading    
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      selectCard: (Class) => dispatch(actions.setActiveTeacherUsername(Class)),
      setInfoBoxNULL: () => dispatch( actions.setInfoBox(null) ),
      setTeachers: (value) => dispatch(actions.setTeachers(value)),
    };
  };
  
  export default connect( mapStateToProps, mapDispatchToProps )( AdminMain );
