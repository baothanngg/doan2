// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract CertificateStorage {
    struct Certificate {
        string recipientName;  // Tên người nhận
        string courseName;     // Tên khóa học
        string courseCode;     // Mã khóa học
        uint256 issueDate;     // Ngày cấp chứng chỉ (dạng timestamp)
        string ipfsCID;        // CID của chứng chỉ được lưu trên IPFS (Pinata)
        address issuer;        // Địa chỉ của người cấp chứng chỉ (người dùng smart contract)
    }

    // Mapping để lưu trữ chứng chỉ, với mã băm (hash) của thông tin là khóa
    mapping(bytes32 => Certificate) public certificates;
    
    // Mảng chứa tất cả các mã băm (certificateId)
    bytes32[] public certificateIds;

    // Sự kiện khi chứng chỉ được thêm
    event CertificateAdded(
        bytes32 indexed certificateId,
        string recipientName,
        string courseName,
        string courseCode,
        uint256 issueDate,
        string ipfsCID,
        address issuer
    );

    // Hàm để thêm chứng chỉ vào blockchain
    function addCertificate(
        string memory recipientName,
        string memory courseName,
        string memory courseCode,   
        uint256 issueDate,
        string memory ipfsCID
    ) public {
        // Tạo mã băm từ thông tin chứng chỉ
        bytes32 certificateId = keccak256(abi.encodePacked(recipientName, courseName, courseCode, issueDate));
        
        // Kiểm tra nếu chứng chỉ đã tồn tại
        require(certificates[certificateId].issuer == address(0), "Certificate already exists");

        // Lưu trữ chứng chỉ vào blockchain
        certificates[certificateId] = Certificate({
            recipientName: recipientName,
            courseName: courseName,
            courseCode: courseCode,  
            issueDate: issueDate,
            ipfsCID: ipfsCID,
            issuer: msg.sender
        });

        // Thêm certificateId vào mảng certificateIds
        certificateIds.push(certificateId);

        // Phát sự kiện chứng chỉ được thêm
        emit CertificateAdded(certificateId, recipientName, courseName, courseCode, issueDate, ipfsCID, msg.sender);
    }

    // Hàm để xác thực chứng chỉ bằng cách nhập thông tin, sau đó lấy ra CID
    function verifyCertificateByInfo(
        string memory recipientName,
        string memory courseName,
        string memory courseCode,  
        uint256 issueDate
    ) public view returns (string memory) {
        // Tạo mã băm từ thông tin cung cấp (không bao gồm CID)
        bytes32 certificateId = keccak256(abi.encodePacked(recipientName, courseName, courseCode, issueDate));
        
        // Kiểm tra xem chứng chỉ có tồn tại hay không
        require(certificates[certificateId].issuer != address(0), "Certificate does not exist");

        // Trả về CID của chứng chỉ
        return certificates[certificateId].ipfsCID;
    }

    // Hàm để xác thực chứng chỉ bằng cách sử dụng CID (nếu cần)
    function verifyCertificateByCID(
        string memory ipfsCID
    ) public view returns (bool) {
        // Duyệt qua tất cả các chứng chỉ để kiểm tra CID
        for (uint i = 0; i < certificateIds.length; i++) {
            bytes32 certId = certificateIds[i];
            Certificate memory cert = certificates[certId];
            if (keccak256(abi.encodePacked(cert.ipfsCID)) == keccak256(abi.encodePacked(ipfsCID))) {
                return true;  // CID hợp lệ, chứng chỉ là thật
            }
        }
        return false;  // CID không khớp, chứng chỉ có thể là giả
    }

    // Hàm trả về danh sách tất cả mã băm của chứng chỉ
    function getAllCertificateIds() public view returns (bytes32[] memory) {
        return certificateIds;
    }
}
