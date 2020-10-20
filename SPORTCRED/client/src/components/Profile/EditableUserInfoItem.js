import React from 'react';
import Grid from '@material-ui/core/Grid'
import EditableText from "./EditText";


export default function EditableUserInfoItem(props) {

    const [answer, setAnswer] = React.useState(props.answer)

    const answerChange = (newAnswer) => {
        props.setAnswer(props.prompt[0],newAnswer);
        setAnswer(newAnswer);
    }

        return <Grid container spacing={0}>
            <Grid item xs={6}><b>
                {props.prompt}
            </b>
            </Grid>
            <Grid item xs={6}>
                <EditableText prompt={props.prompt} value={answer} setValue={answerChange} validationForSave={props.validationForSave}/>
            </Grid>
        </Grid>
}