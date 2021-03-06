import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import {setAuthRedirect} from '../../store/actions/auth';
import { ProgressSpinner } from 'primereact/progressspinner';
import * as uris from '../../store/uris';
import * as actions from '../../store/actions/teacher';
import './DataTable.css';

class DataTableView extends Component {
    constructor(props){
        super(props);
        this.exportCSV = this.exportCSV.bind(this);
    }
    componentDidMount() {
        if (!this.props.activeClass) this.props.setInfoBox({summary:"Info Message", detail: 'No Active Class Selected!!!'});
        this.props.setRedirectNULL();
        let i;
        for(i=0;i<this.props.classStudentValues.length;i++){
            if (this.props.classStudentValues[i].classId === this.props.activeClass){
                this.props.setActiveStudentIndex(i);
                break;
            }
        }
        if (i === this.props.classStudentValues.length && this.props.activeClass !== null){
            fetch(uris.FETCH_CLASS_STUDENT_LIST+this.props.activeClass, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }})
                .then(res => res.json())
                .then(res => {
                    if (res.status === 'success') {
                        let temp = [...res.data];
                        for (let i=0; i<temp.length; i++){
                            if (temp[i].theory_marks === -2 || temp[i].practical_marks === -2 ) temp[i].remarks = 'NQ';
                            else if (temp[i].theory_marks === -1 || temp[i].practical_marks === -1 ) temp[i].remarks = 'Absent';
                            else temp[i].remarks = 'Regular';
                        }
                        this.props.setClassStudentValues({classId:this.props.activeClass, data: temp});
                        this.props.setActiveStudentIndex(this.props.classStudentValues.length-1);
                    } else {
                        this.toast.show({severity: 'error', summary: 'Section Marks Fetch Failed', detail: res.message});
                    }
                })
                .catch(err => console.log(err));
        }
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    render() {
        let recordDatas = this.props.classStudentValues[this.props.classIndex];
        return (
            <Fragment>
                {this.props.infoBox ? <Redirect to='/'/> : null}
                {this.props.loading ? <div style={{paddingTop: '50px'}}><ProgressSpinner style={{width: '100%'}}/></div> :
                <Fragment>
                    {recordDatas ? (
                        <div className="datatable-editing">
                        <Toast ref={(el) => this.toast = el} />
                        
                        <div className="card">
                            <h3 style={{color: '#B22222'}}>Marks Summary View : Assessment and Practical Marks are NOT Editable</h3>
                            <div className="p-col p-offset-11">
                                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={this.exportCSV} />
                            </div>
                            <DataTable ref={(el) => this.dt = el}  value={recordDatas.data} header={"Student Data for Section "+this.props.sectionSubject[0]+
                                        " of Subject with Subject Code : "+this.props.sectionSubject[1]+" ------ TheoryFM: "+this.props.sectionSubject[2]+' ------ PracticalFM: '+this.props.sectionSubject[3]}>
                                <Column field="username" style={{width: '150px'}} header="RollNo" sortable></Column>
                                <Column field="full_name" style={{width: '350'}} header="Name" sortable></Column>
                                <Column field="theory_marks" style={{width: '150px'}} header="Assessment" sortable></Column>
                                <Column field="practical_marks" style={{width: '150px'}} header="Practical" sortable></Column>
                                <Column field="remarks" style={{width: '150px'}} header="Remarks" sortable></Column>
                            </DataTable>
                        </div>
                        </div>
                    ) : null}
                </Fragment>}
            </Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        activeClass: state.teacher.activeClass,
        classStudentValues: state.teacher.classStudentValues,
        classIndex: state.teacher.activeClassStudentValuesIndex,
        sectionSubject: state.teacher.activeSectionSubject,
        loading: state.teacher.loading,
        infoBox: state.teacher.infoBox
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setRedirectNULL: () => dispatch(setAuthRedirect(null)),
        setClassStudentValues: (values) => dispatch(actions.setClassStudentValues(values)),
        setActiveStudentIndex: (value) => dispatch(actions.setActiveStudentIndex(value)),
        setInfoBox: (value) => dispatch( actions.setInfoBox(value) )
    };
};
  
export default connect( mapStateToProps, mapDispatchToProps )( DataTableView );
