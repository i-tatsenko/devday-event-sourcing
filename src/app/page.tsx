import styles from "./page.module.css";
import {LoginForm} from "@/app/LoginForm";

export default function Home() {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
       <LoginForm />
      </main>

    </div>
  );
}
