function getToken() {
    return localStorage.getItem('token');
}

// 유저정보 가져오는 함수
async function getUserByToken(token) {
    try {
        const res = await axios.get('https//api.marktube.tv/v1/me', {
            /// 토큰 값을 담아서 보내야 한다
            headers: {
                // 서버와 이렇게 보내기로 약속한다라는 미리 정의된 행위이다.
                Authorizaiton: `Bearer ${token}` // token값을 미리 서버에서 계산을 해서 확인 후 문제 없으면 그 토큰 값을 가지고 있는 유저의 정보를 내려주게 됨(토큰값을 가지고 있을 때는 로그인 할 때이다. 그래서 로그인 정보가 맞을 시)
            }
        });
        return res.data; // user의 정보
    } catch (error) {
        // 어떤이유로 catch(오류)가 되었는지 설명
        console.log('getUserByToken error', error);

        return null; // try 안 행위를 하다가 문제가 됐을 때 인증이 안되거나 토큰의  값에 문제가 생겼을 때 null을 리턴해주고 그 리턴된 null값은 토큰으로 서버에서 나의 정보 받아오기로 넘어가게 된다.
    }

    // user 정보 잘 들어오고 있는지 확인
    console.log(user);
}

// login.js와 마찬가지로 event가 넘어옴
async function save(event) {
    event.preventDefault(); //submit이 계속 진행되지 않도록 한다. 원래 html submit 버튼 누르면 폼이 하는 행동을 정지시키는 함수
    event.stopPropagation(); // 폼을 가지고 있는 상위 DOM에도  이벤트가 전달되지 않도록 하는 함수
    console.log('save');

    // 이벤트의 타겟들에 was-validated가 들어가기 때문에 꼭 폼태그에다가 이벤트 들어오는 것에 target에 classlist로 was-validated를 추가해주는 행위를 하면 유효성 검사를 DOM에다 뷰로 보여주게 됨
    event.target.classList.add('was-validated'); // 부트스트랩에 있는 기능으로 was-valigated가 추가되면 버튼이 문제가 없기 때문에 그런 ui로 바뀌게 되는 기능이다.(문제가 없으면 실행)


    const titleElement = document.querySelector('#title');
    const messageElement = document.querySelector('#message');
    const authorElement = document.querySelector('#author');
    const urlElement = document.querySelector('#url');

    const title = titleElement.value;
    const message = messageElement.value;
    const author = authorElement.value;
    const url = urlElement.value;


    // 기본적인 유효성 검사(title이 빈칸이거나, message가 빈칸이거나 author이 빈칸이거나 url이 빈칸이면)
    if (title === '' || message === '' || author === '' || url === '') {
        // 더이상 진행하지 않도록 멈추기
        return;
    }

    // 토큰 획득
    const token = getToken();

    // 토큰 사라졌을 때 대비
    if (token === null) {
        location.assign('/login'); //로그인 페이지로 이동
        return; //정지
    }

    // 서버로 보내는 작업
    try {
        // res를 받아서 표현할 것이 없기 때문에 const res = 를 지우고 await부터 써서 표현해도 괜찮다.
        const res = await.axios.post('https://api.marktube.tv.v1/book', {
            // DOM에서 얻은 정보들
            title,
            message,
            author,
            url

        }, {
            // 옵션으로 얻은 토큰들도 같이 전달해야함-어떤 사람이 추가했는지 확인하고 인증도 처리가 돼야되기 때문, 이 api는 이 토큰을 가진 사람은 사용할 수 있다는 증명의 용도
            headers: {
                Authorizaiton: `Bearer ${token}`
            }
        });
        location.assign('/index'); //인덱스 페이지로 다시 넘겨줌
    } catch (error) {
        console.log('save error', error);
        alert('책 추가 실패');
    }
}

function bindSaveButton() {
    const form = document.querySelector('#form-add-book');
    form.addEventListener('submit', save); //submit 이벤트 발생시 save 함수 연결
}

async function main() {
    // 버튼에 이벤트 연결
    bindSaveButton(); // submit 버튼에 연결

    // 토큰 체크
    const token = getToken();
    if (token === null) {
        location.assign('/login');
        return;
    }

    // 토큰으로 서버에서 나의 정보 받아오기-토큰이 유효한지 체크하기 위해서
    const user = await getUserByToken('token');
    if (user === null) {
        localStorage.clear();
        location.assign('/login');
        return;
    }
}


document.addEventListener('DOMContentLoaded', main); //DOM 로드 되면 main 함수 연결