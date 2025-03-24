
function ToolBar()
{
    return(
        <div className='ToolBar'>
            <details>
                <summary>Magazine</summary>
                    <button>Show devices</button><br/>
                    <button>Receiving devices</button><br/>
                    <button>Spending devices</button><br/>
            </details>
            <details>
                <summary>Raports</summary>
                    <button>Invoices</button><br/>
                    <button>Settlements</button><br/>
            </details>
            <details>
                <summary>Add</summary>
                    <button>New destination</button><br/>
                    <button>New device</button><br/>
            </details>
        </div>
    );
}

export default ToolBar;