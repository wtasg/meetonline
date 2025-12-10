import "./App.css";
import { Menu } from "./features/Menu";
import { Content } from "./features/Content";
import { navigateTo } from "./hooks/useNavigate";

function App() {

    return (
        <div className="vflex">
            <header className="header flex sb">
                <div className="flex vac hac m0_2 fs4 fwb clickable" onClick={() => navigateTo("/")}>MeetOnline</div>
                <div>
                    <Menu />
                </div>
            </header >
            <section className="content flex">
                <Content />
            </section>
            <footer className="footer flex vac hac"></footer>
        </div >
    );
}

export default App;
