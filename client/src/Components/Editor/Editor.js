import React, {useRef, useState} from 'react';
import EmailEditor from 'react-email-editor';
import JSON from "JSON";
import axios from "axios";
import env from "../../env_var";

const Editor = () => {

    const [shop, changeShop] = useState('');

    const emailEditorRef = useRef(null);
    const saveTemplate = () => {
        emailEditorRef.current.editor.saveDesign((design) => {
            console.log(design)
            axios.post(env['BACKEND']+"backup", {
                backup: JSON.stringify(design),
                token: localStorage.getItem("token")
            }).then(() => alert("Template successfully saved to cloud")).catch((err) => console.log(err))
        });
    }

    const loadTemplate = () => {
        axios.get(env['BACKEND']+"backup", {
        params: {
            token: localStorage.getItem('token')
        }
    }).then((res) => {
        if (res.data)
            emailEditorRef.current.editor.loadDesign(JSON.parse(res.data['backup']))
        else
            alert("No backup found")
        })
    }

    const downloadHtml = () => {
        emailEditorRef.current.editor.exportHtml((data) => {
            const element = document.createElement("a");
            const file = new Blob([data.html], {type: 'text/html'});
            element.href = URL.createObjectURL(file);
            element.download = "export.html";
            document.body.appendChild(element);
            element.click();
        })
    }


    const handleShopChange = (e) => changeShop(e.target.value)

    const handleShopSubmit = () => {
        const element = document.createElement("a");
        element.href = env['BACKEND']+'login?shop='+shop+".myshopify.com"
        document.body.appendChild(element);
        element.click();
    }

    const signOut = () => {
        localStorage.clear()
        const element = document.createElement("a");
        element.href = window.location.origin
        document.body.appendChild(element);
        element.click();
    }

    if (!localStorage.getItem('token'))
        return (<>
            <form onSubmit={handleShopSubmit}>
                <div className="input-group mb-3">
                    <input type="text" className="form-control input-group-append" value={shop} onChange={handleShopChange} placeholder="Shop Name"/>
                    <span className="input-group-text" >.myshopify.com/</span>
                </div>
                <input type="submit" className="btn btn-primary" onClick={handleShopSubmit} value="Install" />
            </form>
        </>)
    else
        return (
                <>
                    <div className="row">
                        <div className="col"/>
                        <button className="btn btn-primary col-auto" onClick={signOut}> Sign Out </button>
                        <div className="col-auto"/>
                    </div>
                    <EmailEditor
                        ref={emailEditorRef}
                    />

                    <br/>

                    <div className="row">
                        <div className="col"/>
                        <button className="btn btn-primary col-auto" onClick={saveTemplate}> Save template to cloud </button>
                        <div className="col-auto"/>
                        <button className="btn btn-primary col-auto" onClick={loadTemplate}> Load template from cloud </button>
                        <div className="col-auto"/>
                        <button className="btn btn-primary col-auto" onClick={window.location.reload.bind(window.location)}> Clear workspace </button>
                        <div className="col"/>
                    </div>
                    <br/>
                    <div className="row">
                        <div className="col"/>
                        <button className="btn btn-primary col-auto" onClick={downloadHtml}> Download as HTML</button>
                        <div className="col"/>
                    </div>
                </>
        );

}

export default Editor;
