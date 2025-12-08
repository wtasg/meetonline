import "./App.css";
import { Menu } from "./features/Menu";
import { Content } from "./features/Content";

function App() {

    return (
        <div className="vflex">
            <header className="header flex sb">
                <div className="flex vac hac m0_2 fs4 fwb">MeetOnline</div>
                <div>
                    <Menu />
                </div>
            </header>
            <section className="content flex">
                <Content />
            </section>
            <footer className="footer flex vac hac"></footer>
        </div>
    );
}

export default App;
