    import { RiUser3Line } from "react-icons/ri";
    import { RiArrowLeftDoubleLine } from "react-icons/ri";
    import { RiArrowRightDoubleLine } from "react-icons/ri";
    import { RiEdit2Fill } from "react-icons/ri";
    import { RiCheckDoubleFill } from "react-icons/ri";
    import '@/style/dashboard.css'

    const page = () => {
        return (
            <section>
                <nav className="navbar">
                    <div className="greet">Halo, admin</div>
                    <div className="profile">
                        <RiUser3Line />
                    </div>
                </nav>
            
                <div className="table">
                    <div className="userData">
                        <thead>
                            <tr>
                                <th>UID</th>
                                <th>Nama</th>
                                <th>No telp</th>
                                <th>Ruangan</th>
                                <th>Status</th>
                                <th>Kendala</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>LAP001</td>
                                <td>Koki</td>
                                <td>08129342</td>
                                <td>D23</td>
                                <td>
                                    <select>
                                        <option value="option1" className="pending" >Pending</option>
                                        <option value="option2" className="progress" >In progress</option>
                                        <option value="option3" className="done">Done</option>
                                    </select>
                                </td>
                                <td>AC BOCOR</td>
                                <td className="action">
                                    <button><RiEdit2Fill/></button>
                                    <button><RiCheckDoubleFill/></button>
                                </td>
                            </tr>
                        </tbody>
                    </div>
                </div>

                <div className="pagination">
                    <ul>
                        <li><a href="#"><RiArrowLeftDoubleLine /></a></li>
                        <li><a href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#"><RiArrowRightDoubleLine /></a></li>
                    </ul>
                </div>
            </section>
        )
    }

    export default page;

