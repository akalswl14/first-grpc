# gRPC 공부

## RPC란?

- **Remote Procedure Call** -> 원격 프로시저 호출
- 프로시저 : 프로그램의 동작에 대한 절차 혹은 그 일부
- 임의의 함수를 네트워크 어디에서나 그대로 사용하게 하는 기술
- 분산시스템에서 다른 머신의 `서버 어플리케이션에 있는 메소드`를 자신이 갖고 있는 것 처럼 호출할 수 있게 해주는 프레임워크.
- RPC는 요청자가 어떤 환경에서 어떤 프로그램으로 접근하던간에 같은 함수를 제공할 수 있어야 하므로 환경과 언어에 중립적일 수 있는 설계 원칙을 가지고 있다.

## RPC의 컴포넌트

- ![[Pasted image 20220905011357.png]]

## IDL

- Interface Description Language
- 서로 다른 주소/언어/환경을 가진 애플리케이션들의 통신을 위해 도입된 별도의 언어
- 서로 다른 환경 / 언어 사이에서 공통 인터페이스 역할
- RPC 컴파일러가 IDL로 작성된 함수를 각 언어로 변환해 주기 때문에 네트워크의 종단에서는 자신의 언어를 사용해 RPC 함수를 원격 호출할 수 있게 된다.

## RPC 컴파일러

- 타 언어 - IDL 간 번역을 지원하는 프로그램

### 컴파일 과정

1. 개발자가 IDL을 사용해 함수를 작성한 뒤 RPC 컴파일러를 실행시키면 그 결과로 서버 / 클라이언트 소스코드가 생성된다.
2. 생성되는 소스코드의 형태는 메시지 포맷 / RPC 함수 / 이들에 접근할 수 있게 해 주는 객체인 Stub 등등으로, 선택한 언어에 알맞게 생성된다.
3. 이후 Server Stub은 서버 쪽 컴퓨터에, Client Stub은 클라이언트 쪽 컴퓨터에 심어준 뒤 RPC 함수를 마치 로컬에서 쓰는 것처럼 사용하면 된다.

## RPC의 장단점

### 장점

- 환경 및 언어에 중립적이기 때문에 상황이 어떻게 변하던간에 API 구현 자체에만 집중할 수 있다.
- 요청-응답 시 IDL이 전송되기 때문에 IDL의 설계가 통신에 최적화 되어있을수록 로드가 낮아진다.

### 단점

- IDL로 메시지를 코딩하는 방법을 따로 익혀야 한다.
- 브라우저 단에서 RPC를 지원하지 않아 웹 서비스를 위해서는 다른 Add-on이 필요하다.
- RPC의 번역-전송-번역 프로세스 자체가 로드가 될 수도 있다.
- 컴파일러의 언어 지원 범위에 의존적이다.

## RPC의 기타 특징

- RPC는 동기식 통신이기 때문에 상황에 따라 채택해야 한다.
- RPC는 표준이 아니므로 좋은 구현체를 찾아 사용해야 한다.

## gRPC의 특징

- 구글에서 개발한 RPC 구현체
- MSA에 적합
- 동기식 / 비동기식 둘 다 지원
- 지원 언어 : gRPC 컴파일러를 통해 Python, PHP, Ruby, Node, Go, C++ 등 11종의 언어를 IDL로 자동 생성
- Proto라는 자체 개발 IDL를 사용

### Proto

- 사람이 읽고 작성하기 편하도록 구조체의 형식
- 전송시 직렬화(serializationㅇ) 과정을 거치면서 ProtoBuf가 생성된다.
- IDL로 Proto를 사용한다면 ProtoBuf로의 직렬화 속도가 매우 빠르고 인코딩 기법이 효율적이라 메시지 용량이 작다.
- 어떻게 빠르게 인코딩이 이루어지는가 : https://developers.google.com/protocol-buffers/docs/encoding
- HTTP 2.0 프로토콜 지원
  - 양방향 스트리밍 가능 : 서버와 클라이언트가 서로 동시에 데이터를 스트리밍으로 주고 받을 수 있다
  - 높은 메시지 압축률 & 높은 헤더 압축률 : 네트워크 트래픽이 줄어들어 시스템 리소스 절약 및 성능 개선 가능

#### 직렬화 매커니즘 Serialization

```
 message Person {
		string name = 1;
		int32 id = 2;
		bool has_ponycopter = 3;
}
```

- 위와 같이 proto파일을 정의한 후, protocol buffer compiler인 protoc를 사용해서 원하는 언어로(proto 파일 안에 정의해둔 언어로) 컴파일 할 수 있다. 예를 들어 c++를 선택하면 message Person은 Class Person으로 컴파일 된다.

## gRPC의 4가지 서비스 메소드

1. Simple req/res

- Format :  rpc 메소드명(req_TYPE) returns (res_TYPE) { }
- client가 server로 stub을 사용하여 request를 보내고 response를 기다린다.
- 서버에 single request를 보내면, 서버는 single response를 돌려준다.
- 일반적인 함수 호출과 같음

```
rpc SayHello(HelloRequest) returns (HelloResponse){
}
```

2. Server-side Streaming

- Format : rpc 메소드명(req_TYPE) returns (stream res_TYPE) { }
- **response** type 이전에 stream 키워드를 명시해 준다.
- 과정
  1.  client가 server로 요청(single request)을 보내 stream을 얻는다.
  2.  이 stream을 통해 server에서 돌아오는 메시지 시퀀스들을 읽는다.
  3.  메시지가 끊길 때 까지 stream을 읽는다.

```
rpc LotsOfReplies(HelloRequest) returns (stream HelloResponse){
}
```

3. Client-side Streaming

- Format : rpc 메소드명(stream req_TYPE) returns (res_TYPE) { }
- **request** type 이전에 stream 키워드를 명시해 준다.
- 과정
  1.  client가 stream을 통해 메시지 시퀀스를 server로 만들어 보낸다.
  2.  client가 메시지 작성을 끝내면, server가 메시지를 읽고 응답을 보낼 때 까지 기다린다.

```
rpc LotsOfGreetings(stream HelloRequest) returns (HelloResponse){
}
```

4. Bidirectional Streaming

- Format : rpc 메소드명(stream req_TYPE) returns (stream res_TYPE) { }
- **request / response** type 앞에 stream을 모두 명시해 줍니다.
- read/write stream을  양방향으로 메시지 시퀀스를 보낼 수 있.
- 두개의 stream이 독립적으로 동작하기 때문에 server/client는 순서에 관계없이 교대로 read/write가 가능하다.
- 각 stream의 메시지 순서는 보장된다.
- 서버는 클라이언트의 모든 메시지를 읽은 뒤 response를 write할 수도, 아니면 번갈아 가며 한 메시지씩 읽고 쓸 수도 있다.

```
rpc BidiHello(stream HelloRequest returns (stream HelloResponse)
```

## gRPC - 타임아웃 / 데드라인

- 클라이언트가 메소드 호출시 데드라인이 포함된다.
- 클라이언트가 RPC호출을 얼마나 기다릴 수 있는지에 대한 값
- 이에 대해, 서버는 특정 RPC가 타임아웃되었는지 혹은 RPC를 마칠때까지 얼마나 남았는지 쿼리할 수 있다.

## gRPC - 인증 Authentication

- Token기반 인증 (with Google) Google API 에 gRPC 접근할때는 OAuth2 token과 같은 access token이 필요하다.
- gRPC는 전체 gRPC 채널을 생성하거나 개별 call을 만들 때 사용되는 Credentials 오브젝트에 기반하여 인증 API를 제공한다.

참고 자료

- https://juneyr.dev/2018-07-30/what-is-grpc
- https://sukill.tistory.com/85
- https://blog.naver.com/siniphia/222486033775
- https://blog.naver.com/siniphia/222486088548
- https://grpc.io/docs/languages/node/basics/
- https://github.com/grpc/grpc-node
- https://www.trendmicro.com/en_ae/devops/22/f/grpc-api-tutorial.html
