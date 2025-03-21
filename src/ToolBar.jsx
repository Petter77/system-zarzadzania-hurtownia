
function ToolBar()
{
    return(
        <div className='ToolBar'>
            <details>
                <summary>Magazine</summary>
                    <a>Show devices</a><br/>
                    <a>Receiving devices</a><br/>
                    <a>Spending devices</a><br/>
            </details>
            <details>
                <summary>Raports</summary>
                    <a>Invoices</a><br/>
                    <a>Settlements</a><br/>
            </details>
            <button>New</button>
        </div>
    );
}

export default ToolBar;