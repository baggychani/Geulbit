"""
start.py — 한글 색채 분리 도구 실행 스크립트

IDE에서 이 파일을 실행하면:
1. npm 의존성 설치 확인
2. Vite dev 서버 시작
3. 브라우저 자동 열기
"""

import os
import subprocess
import sys
import threading
import time
import webbrowser

# 프로젝트 루트 (이 파일이 있는 폴더)
ROOT = os.path.dirname(os.path.abspath(__file__))
URL = "http://localhost:5173"


def run(cmd, **kwargs):
    return subprocess.run(cmd, cwd=ROOT, shell=True, **kwargs)


def check_node():
    result = run("node --version", capture_output=True, text=True)
    if result.returncode != 0:
        print("❌ Node.js가 설치되어 있지 않습니다.")
        print("   https://nodejs.org 에서 설치 후 다시 실행하세요.")
        sys.exit(1)
    print(f"✅ Node.js {result.stdout.strip()}")


def install_deps():
    node_modules = os.path.join(ROOT, "node_modules")
    if not os.path.isdir(node_modules):
        print("📦 패키지 설치 중... (최초 1회)")
        run("npm install")
    else:
        print("✅ node_modules 확인됨")


def open_browser():
    """서버가 뜰 때까지 잠시 기다린 후 브라우저 오픈"""
    time.sleep(2.5)
    print(f"\n🌐 브라우저 열기: {URL}\n")
    webbrowser.open(URL)


def start_server():
    print("\n" + "=" * 50)
    print("  한글 색채 분리 도구  |  교사 전용")
    print("=" * 50)
    print(f"  주소: {URL}")
    print("  종료: Ctrl+C")
    print("=" * 50 + "\n")

    # 브라우저는 별도 스레드에서 지연 실행
    t = threading.Thread(target=open_browser, daemon=True)
    t.start()

    # Vite dev 서버 실행 (포그라운드)
    try:
        run("npm run dev")
    except KeyboardInterrupt:
        print("\n\n서버를 종료했습니다.")


if __name__ == "__main__":
    check_node()
    install_deps()
    start_server()
