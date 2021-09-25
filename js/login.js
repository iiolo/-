function getToken() {
    return localStorage.getItem('token');
}

async function login (event) {
    // 이벤트가 들어오게 되면 submit이라는 것은 항상 submit이라는 원래 정의된 흐름에 따라 진행되려 하는 특성이 있기 때문에 그 특성을 이벤트로 막아줘야 함
    event.preventDefault(); // 더이상 submit 관련된 로직이 내가 작성한 것 이외에 진행되지 않도록 막아줌

    event.stopPropagation(); // submit 이벤트가 상위로 전달되지 않도록 막아주면 불필요한 일이 생기지 않는다.

    // login html의 폼의 input요소 DOM 얻어오기
    const emailElement = document.querySelector('#email');
    const passwordElement = document.querySelector('password');

    // input 창에 있는 input 값 가져오기
    const email = emailElement.value;
    const password = passwordElement.value;

    // 얻어온 email과 password를 서버에 보내서 문제가 있는지 없는지 확인
    try{
        const res = await axios.post(/*주소*/'https://api.marktube.tv/v1/me', {
            /*보낼 데이터의 객체*/
            email,
            password 
        } );

        // 데이터에 객체가 담겨옴
        const {token /*객체 중 필요한 값만 빼내기 위해서*/} = res.data;// const token = res.data.token; 과 같다
         
        // 잘못된 데이터가 내려와서 토큰이 없을 경우 
        if(token === undefined) {
            // 끝내도록 하고 다시 시작할 수 있게 해야 함
            return;
        }
        localStorage.setItem('token', token); //token 이라는 이름에 실제 token값 입력할 수 있게 처리하고 local storge에 넣기
        location.assign('/');

    } catch (error){
        // 정상적으로 요청한 것이 res로 당겨오지 않을 시

        // try 실행시 에러 발생이 그 에러에 대한 상황을 보여줄 수 있다.

        if(data){
            // 데이터 객체의 에러를 이름을 내려주고 그것을 state에 할당
            const state = data.error;
            if(state === 'USER_NOT_EXIST') /* USER_NOT_EXIST가 내려온다면  alert으로 경고 보여줌*/{
                
                
                alert('사용자가 존재하지 않습니다.')
            } else if(state === 'PASSSWORD_NOT_MATCH') {
                alert('비밀번호가 틀렸습니다.')
            }
        }

    }

}

function bindLoginButton() {
    const form = document.querySelector('#form-login');

    //submit 이벤트 들어오면 login 로직 실행, login 함수는 바로 addEventListener로 연결되어 있기 때문에 submit이 호출되면 바로 login 함수가 submit에 대한 이벤틀를 가지고 실행된다  
    form.addEventListener('submit', login);
}

function main() {
    // 버튼에 이벤트 연결'
    bindLoginButton();

    // 토큰 체크(만약에 로그인이 되어있는 상태라면 로그인 페이지를 나가도록 유도)
    const token = getToken();
    if(token !== null) {
        location.assign('/');
        return;
    }
}

document.addEventListener('DOMContentLoaded', main);