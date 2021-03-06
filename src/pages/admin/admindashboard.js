import React, {Fragment} from 'react';
import "./admindash.css";
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { Button } from "primereact/button";
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { CSVDownload } from 'react-csv';
import * as uris from '../../store/uris';

class AdminDashboard extends React.Component {

constructor(props){
    super(props);
    this.state = {
             selectedSem: null,
             uniqueRoll: '',
             loading: false,
             data: null,
             countData: {teachers: 0, students: 0},
             refreshDialog: false,
             batch_code: '',
             deadline: '',
             credentials: []
    };  
    this.semester = ['1','2','3','4','5','6','7','8'];  
    this.onSemesterChange = this.onSemesterChange.bind(this);
    this.onFetchStudentSemMarks = this.onFetchStudentSemMarks.bind(this);
    this.confirmRefresh = this.confirmRefresh.bind(this);
    this.hideRefreshDialog = this.hideRefreshDialog.bind(this);
    this.confirmRefreshFlow = this.confirmRefreshFlow.bind(this);
    this.setDeadline = this.setDeadline.bind(this);
}

componentDidMount(){
    fetch(uris.FETCH_STATS, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }})
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            this.setState({countData: res.data})
        } else {
            this.toast.show({severity: 'error', summary: 'Stats Fetch Failed', detail: res.message});
        }
    })
    .catch(err => console.log(err))

    fetch(uris.POST_DEADLINE, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }})
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            this.setState({deadline: res.deadline.substring(0, 10)})
        } else {
            this.toast.show({severity: 'error', summary: 'Deadline Fetch Failed', detail: res.message});
        }
    })
    .catch(err => console.log(err))
}

onSemesterChange(e) {
    this.setState({ selectedSem: e.value });
}
    onFetchStudentSemMarks(){
        if (this.state.uniqueRoll !== '' && this.state.selectedSem !== null) {
            this.setState({loading: true})
            fetch(uris.FETCH_STUDENT_DETAILS+'?username='+this.state.uniqueRoll, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }})
            .then(res => res.json())
            .then(res => {
                fetch(uris.FETCH_STUDENT_SEM_MARKS+'?person_id='+res.data.person_id+'&semester='+this.state.selectedSem, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }})
                    .then(res => res.json())
                    .then(res => {
                        if (res.status === 'success') {
                            this.setState({data: res.data, loading: false})
                        } else {
                            this.toast.show({severity: 'error', summary: 'Student Details Fetch Failed', detail: res.message});
                        }
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err))
        }else{
            this.toast.show({severity: 'error', summary: 'Invalid Input', detail: 'Please input a valid value!!!'})
        }
    }

    hideRefreshDialog() {
        this.setState({
            refreshDialog: false
        });
    }

    confirmRefresh(rType) {
        this.setState({
            refreshDialog: rType
        });
    }

    confirmRefreshFlow() {
        let postURI = (this.state.refreshDialog === 'year' ? uris.POST_YEAR_REFRESH : uris.POST_SESSION_REFRESH);
        fetch(postURI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ batch_code: this.state.batch_code})
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    this.toast.show({severity: 'info', summary: 'Database Updated', detail: 'Successfully Refreshed '+this.state.refreshDialog});
                    this.state.refreshDialog === 'year' ? this.setState({credentials: res.credentials, refreshDialog: false}) : this.setState({refreshDialog: false});
                } else {
                    this.toast.show({severity: 'error', summary: 'Database Update Failed', detail: res.message});
                    this.setState({refreshDialog: false});
                }
                fetch(uris.FETCH_STATS, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }})
                .then(res => res.json())
                .then(res => {this.setState({countData: res.data})})
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err));
    }

    setDeadline(value){
        fetch(uris.POST_DEADLINE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({deadline: value.toISOString().substring(0, 10)})
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    this.setState({deadline: value.toISOString().substring(0, 10)})
                    this.toast.show({severity: 'info', summary: 'Deadline Updated', detail: 'Successfully Changed!!'});
                } else {
                    this.toast.show({severity: 'error', summary: 'Deadline Update Failed', detail: res.message});
                }
            })
            .catch(err => console.log(err));
    }

  render() {
    const refreshDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={this.hideRefreshDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={this.confirmRefreshFlow} />
        </React.Fragment>
    );

    let dwnldData;
    if (this.state.credentials.length !== 0) {
        dwnldData = <CSVDownload className="csv-download" target="_self" filename='credentials' data={this.state.credentials}/>
        this.toast.show({severity: 'info', summary: 'Downloaded File Followup', detail: 'Change or Add .csv extension to the Downloaded File!!'});
        this.setState({credentials: []})
    } else {
        dwnldData = null;
    }
    return (<Fragment>        
        <Toast style={{zIndex: 10000}} ref={(el) => this.toast = el} />
        {dwnldData}
        <div className=" p-fluid">
           <div className="p-mt-2 p-grid ">               
                <div className="cardResult  p-mt-2   p-col-3">
                        <div className="p-row headerPAPER">
                       <h2>
                            Total Teachers
                           </h2>
                        </div>
                        <hr/>
                           <div className="numberBIG p-row">
                        {this.state.countData.teachers}
                        </div>
                </div>             
                <div className="cardResult p-mt-2 p-offset-2  p-col-3">
                        <div className="p-row headerPAPER">
                        <h2>
                            Total Students
                            </h2>
                        </div>
                        <hr/>
                           <div className="numberBIG p-row">
                        {this.state.countData.students}
                        </div>
                    </div>
                    <div className="p-col-3">

                <div className="cardResult p-offset-2  p-row">
                <div className="p-grid">
                        <div className="p-col-4">
                            <InputText type="text" width="50px" value={this.state.batch_code} placeholder="Year" onChange={(e) => this.setState({batch_code: e.target.value})}/>
                        </div>
                        <div className="p-col-8">
                            <Button label="Add Students" className="p-button-rounded p-button-success" onClick={() => this.confirmRefresh('year')}/>
                        </div>
                    </div>
                </div>
                <div className="cardResult p-mt-2 p-offset-2  p-row">
                    
                    <Button label="Initiate New Session" className="p-button-rounded p-button-info" onClick={() => this.confirmRefresh('session')}/>
                </div>
                    </div>
                    <div className="p-mt-2 p-col-3">
                        <div className="p-field">
                        
                        <Calendar id="icon" showIcon placeholder="Set Marks Submission Deadline" onChange={(e) => this.setDeadline(e.value)}/>
                    </div>
                    <h3>Marks Submission Till : {this.state.deadline}</h3>
                    </div>
                </div>
           <div className="p-fluid card">
               <div className="p-grid p-lg-12 p-mt-2 ">
                     <div className="p-col">
                         <h3>Unique Roll No</h3>
                            <div className="p-inputgroup">
                                <InputText label="Unique Roll No" value={this.state.uniqueRoll} onChange={(e) => this.setState({uniqueRoll: e.target.value})} placeholder="Enter By Unique Roll No"/>
                            </div>
                        </div>
                        <div className="p-col">
                         <h3>Semester</h3>
                            <div className="p-inputgroup">
                               <Dropdown value={this.state.selectedSem} options={this.semester} onChange={this.onSemesterChange} placeholder="Select Sem" />
                            </div>
                        </div>
                           <div className="p-col">
                               <h3>Search</h3>
                          <Button icon="pi pi-search" onClick={this.onFetchStudentSemMarks}/>
                        </div>
               </div>
                </div>
            </div>
            
            {this.state.loading ? <div style={{paddingTop: '50px'}}><ProgressSpinner style={{width: '100%'}}/></div> : null}
                        {this.state.data ? 
                        <div className="datatable-editing">
                        <Toast ref={(el) => this.toast = el} />
                        
                        <div className="card">
                            <DataTable value={this.state.data} header="Data">
                                <Column field="subject_code" header="Subject Code"></Column>
                                <Column field="title" header="Subject Name"></Column>
                                <Column field="theory_marks" header="Assessment"></Column>
                                <Column field="practical_marks" header="Practical"></Column>
                               
                            </DataTable>
                        </div>
                        </div>:null}
            <Dialog visible={this.state.refreshDialog !== false} style={{ width: '450px' }} header="Confirm" modal footer={refreshDialogFooter} onHide={this.hideRefreshDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem'}} />
                    {<span>Are you sure you want to refresh <b>{this.state.refreshDialog}</b>?</span>}
                    <br/>
                    {this.state.refreshDialog === 'year' ? ' This will Fetch new year Student list!!' : null}
                    {this.state.refreshDialog === 'session' ? 'This will Recreate new Session !!' : null}
                    <br/>
                    <b>NOTE: This may take upto several seconds!!</b>
                </div>
            </Dialog>
    </Fragment>
        
    );
    }
}
export default AdminDashboard;
